/*
 * Copyright (c) 2021 MarkLogic Corporation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package com.marklogic.hub.deploy.commands;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.ObjectWriter;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.appdeployer.command.CommandContext;
import com.marklogic.client.FailedRequestException;
import com.marklogic.client.io.DocumentMetadataHandle;
import com.marklogic.hub.AbstractHubCoreTest;
import com.marklogic.hub.impl.HubConfigImpl;
import com.marklogic.hub.step.StepDefinition;
import com.marklogic.mgmt.util.ObjectMapperFactory;
import org.apache.commons.io.FileUtils;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Arrays;
import java.util.Date;
import java.util.Properties;

import static org.junit.jupiter.api.Assertions.*;

public class LoadUserArtifactsCommandTest extends AbstractHubCoreTest {

    private LoadUserArtifactsCommand loadUserArtifactsCommand;

    @BeforeEach
    public void setup() {
        loadUserArtifactsCommand = new LoadUserArtifactsCommand(getHubConfig());
    }

    @Test
    public void replaceLanguageWithLang() {
        ObjectNode object = ObjectMapperFactory.getObjectMapper().createObjectNode();
        object.put("language", "zxx");
        object.put("something", "else");

        object = loadUserArtifactsCommand.replaceLanguageWithLang(object);
        assertEquals("zxx", object.get("lang").asText());
        assertEquals("else", object.get("something").asText());
        assertFalse(object.has("language"));
        assertEquals("lang", object.fieldNames().next(),
            "lang should still be the first field name in the JSON object");
    }

    @Test
    public void testIsEntityDir() {
        Path startPath = Paths.get("/tmp/my-project/plugins/entities");
        Path dir = Paths.get("/tmp/my-project/plugins/entities/my-entity");
        assertTrue(loadUserArtifactsCommand.isArtifactDir(dir, startPath));

        startPath = Paths.get("/tmp/my-project/plugins/entities");
        dir = Paths.get("/tmp/my-project/plugins/entities");
        assertFalse(loadUserArtifactsCommand.isArtifactDir(dir, startPath));

        startPath = Paths.get("/tmp/my-project/plugins/entities");
        dir = Paths.get("/tmp/my-project/plugins/entities/my-entity/input");
        assertFalse(loadUserArtifactsCommand.isArtifactDir(dir, startPath));

        startPath = Paths.get("/tmp/my-project/plugins/entities");
        dir = Paths.get("/tmp/my-project/plugins/entities/my-entity/input/my-input-flow");
        assertFalse(loadUserArtifactsCommand.isArtifactDir(dir, startPath));

        startPath = Paths.get("/tmp/my-project/plugins/mappings");
        dir = Paths.get("/tmp/my-project/plugins/mappings/my-mappings/input");
        assertFalse(loadUserArtifactsCommand.isArtifactDir(dir, startPath));

        startPath = Paths.get("/tmp/my-project/plugins/mappings");
        dir = Paths.get("/tmp/my-project/plugins/mappings/my-mappings");
        assertTrue(loadUserArtifactsCommand.isArtifactDir(dir, startPath));


        // test windows paths
        startPath = Paths.get("c:\\temp\\my-project\\plugins\\entities");
        dir = Paths.get("c:\\temp\\my-project\\plugins\\entities\\my-entity");
        assertTrue(loadUserArtifactsCommand.isArtifactDir(dir, startPath));

        startPath = Paths.get("c:\\temp\\my-project\\plugins\\entities");
        dir = Paths.get("c:\\temp\\my-project\\plugins\\entities");
        assertFalse(loadUserArtifactsCommand.isArtifactDir(dir, startPath));

        startPath = Paths.get("c:\\temp\\my-project\\plugins\\entities");
        dir = Paths.get("c:\\temp\\my-project\\plugins\\entities\\my-entity\\input");
        assertFalse(loadUserArtifactsCommand.isArtifactDir(dir, startPath));

        startPath = Paths.get("c:\\temp\\my-project\\plugins\\entities");
        dir = Paths.get("c:\\temp\\my-project\\plugins\\entities\\my-entity\\input\\my-input-flow");
        assertFalse(loadUserArtifactsCommand.isArtifactDir(dir, startPath));

        startPath = Paths.get("c:\\temp\\my-project\\plugins\\mappings");
        dir = Paths.get("c:\\temp\\my-project\\plugins\\mappings\\my-mappings\\path1\\path2");
        assertFalse(loadUserArtifactsCommand.isArtifactDir(dir, startPath));

        startPath = Paths.get("c:\\temp\\my-project\\plugins\\mappings");
        dir = Paths.get("c:\\temp\\my-project\\plugins\\mappings\\my-mappings");
        assertTrue(loadUserArtifactsCommand.isArtifactDir(dir, startPath));
    }

    @Test
    public void defaultEntityModelPermissions() {
        DocumentMetadataHandle.DocumentPermissions perms = loadUserArtifactsCommand.buildMetadata(getHubConfig().getEntityModelPermissions(), "http://marklogic.com/entity-services/models").getPermissions();
        assertEquals(DocumentMetadataHandle.Capability.UPDATE, perms.get("data-hub-entity-model-writer").iterator().next());

        perms = loadUserArtifactsCommand.buildMetadata(getHubConfig().getStepDefinitionPermissions(), "http://marklogic.com/data-hub/step-definition").getPermissions();
        assertEquals(DocumentMetadataHandle.Capability.UPDATE, perms.get("data-hub-step-definition-writer").iterator().next());

        perms = loadUserArtifactsCommand.buildMetadata(getHubConfig().getFlowPermissions(), "http://marklogic.com/data-hub/flow").getPermissions();
        assertEquals(DocumentMetadataHandle.Capability.READ, perms.get("data-hub-flow-reader").iterator().next());

        perms = loadUserArtifactsCommand.buildMetadata(getHubConfig().getMappingPermissions(), "http://marklogic.com/data-hub/mappings").getPermissions();
        assertEquals(DocumentMetadataHandle.Capability.READ, perms.get("data-hub-mapping-reader").iterator().next());
    }

    @Test
    public void customEntityModelPermissions() {
        //ensuring that permissions are user configured as opposed to the defaults
        HubConfigImpl config = new HubConfigImpl();
        config.setEntityModelPermissions("manage-user,read,manage-admin,update");
        config.setFlowPermissions("manage-user,read,manage-admin,update");
        config.setMappingPermissions("manage-user,read,manage-admin,update");
        config.setStepDefinitionPermissions("manage-user,read,manage-admin,update");
        DocumentMetadataHandle.DocumentPermissions perms = loadUserArtifactsCommand.buildMetadata(config.getEntityModelPermissions(), "http://marklogic.com/entity-services/models").getPermissions();
        assertEquals(DocumentMetadataHandle.Capability.READ, perms.get("manage-user").iterator().next());
        assertEquals(DocumentMetadataHandle.Capability.UPDATE, perms.get("manage-admin").iterator().next());
        assertNull(perms.get("data-hub-entity-model-writer"));

        perms = loadUserArtifactsCommand.buildMetadata(config.getStepDefinitionPermissions(), "http://marklogic.com/data-hub/step-definition").getPermissions();
        assertEquals(DocumentMetadataHandle.Capability.READ, perms.get("manage-user").iterator().next());
        assertEquals(DocumentMetadataHandle.Capability.UPDATE, perms.get("manage-admin").iterator().next());
        assertNull(perms.get("data-hub-step-definition-writer"));

        perms = loadUserArtifactsCommand.buildMetadata(config.getFlowPermissions(), "http://marklogic.com/data-hub/flow").getPermissions();
        assertEquals(DocumentMetadataHandle.Capability.READ, perms.get("manage-user").iterator().next());
        assertEquals(DocumentMetadataHandle.Capability.UPDATE, perms.get("manage-admin").iterator().next());
        assertNull(perms.get("data-hub-flow-reader"));

        perms = loadUserArtifactsCommand.buildMetadata(config.getMappingPermissions(), "http://marklogic.com/data-hub/mappings").getPermissions();
        assertEquals(DocumentMetadataHandle.Capability.READ, perms.get("manage-user").iterator().next());
        assertEquals(DocumentMetadataHandle.Capability.UPDATE, perms.get("manage-admin").iterator().next());
        assertNull(perms.get("data-hub-mapping-reader"));
    }

    @Test
    public void validateArtifactNames() throws Exception {
        runAsDataHubDeveloper();
        HubConfigImpl hubConfig = getHubConfig();
        LoadUserArtifactsCommand loadUserArtifactsCommand = new LoadUserArtifactsCommand(hubConfig);
        CommandContext commandContext = new CommandContext(hubConfig.getAppConfig(), hubConfig.getManageClient(), hubConfig.getAdminManager());
        ObjectMapper mapper = new ObjectMapper();
        ObjectNode node = mapper.createObjectNode();
        node.put("name", "my Artifact");
        node.put("type", "mapping");

        String errorMessage = "Invalid name: 'my Artifact'; it must start with a letter and can contain letters, numbers, hyphens and underscores only.";
        Path stepDefDir = hubConfig.getStepDefinitionPath(StepDefinition.StepDefinitionType.MAPPING).resolve("myArtifact");
        stepDefDir.toFile().mkdirs();
        File stepDefFile = stepDefDir.resolve("myArtifact.step.json").toFile();
        stepDefFile.createNewFile();
        ObjectWriter writer = mapper.writer();
        writer.writeValue(stepDefFile, node);

        FailedRequestException ex = assertThrows(FailedRequestException.class,
            () -> loadUserArtifactsCommand.execute(commandContext));

        assertEquals(errorMessage, ex.getServerMessage());

        node.remove("type");
        stepDefFile.delete();

        File flowFile = hubConfig.getFlowsDir().resolve("myArtifact.flow.json").toFile();
        flowFile.createNewFile();
        writer.writeValue(flowFile, node);

        ex = assertThrows(FailedRequestException.class,
            () -> loadUserArtifactsCommand.execute(commandContext));
        assertEquals(errorMessage, ex.getServerMessage());

        flowFile.delete();
        Path ingestionStepDir = hubConfig.getHubProjectDir().resolve("steps").resolve("ingestion");
        ingestionStepDir.toFile().mkdirs();
        File ingestionStepFile = ingestionStepDir.resolve("myArtifact.step.json").toFile();
        ingestionStepFile.createNewFile();
        writer.writeValue(ingestionStepFile, node);

        ex = assertThrows(FailedRequestException.class,
            () -> loadUserArtifactsCommand.execute(commandContext));
        assertEquals(errorMessage, ex.getServerMessage());
    }

    @Test
    public void validateMultipleStepDefPathNames() {
        installProjectInFolder("test-projects/multiple-stepDef");
        runAsDataHubDeveloper();
        HubConfigImpl hubConfig = getHubConfig();

        Path stepDefDir = hubConfig.getStepDefinitionPath(StepDefinition.StepDefinitionType.CUSTOM).resolve("multipleStepDefs");
        String[] fileNames = stepDefDir.toFile().list();

        assertTrue(Arrays.asList(fileNames).contains("multipleStepDefs.step.json"));
        assertTrue(Arrays.asList(fileNames).contains("testAnotherStep.step.json"));
        assertTrue(Arrays.asList(fileNames).contains("testStep.step.json"));
    }

    @Test
    public void validateHubCentralConfigFile() {
        installProjectInFolder("test-projects/download-artifacts");
        runAsDataHubDeveloper();
        loadUserArtifactsCommand.execute(newCommandContext());
        assertNotNull(getFinalDoc("/config/hubCentral.json"));
        assertNotNull(getStagingDoc("/config/hubCentral.json"));
    }
}
