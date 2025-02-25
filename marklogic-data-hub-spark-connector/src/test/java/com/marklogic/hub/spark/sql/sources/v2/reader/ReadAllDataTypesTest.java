package com.marklogic.hub.spark.sql.sources.v2.reader;

import com.marklogic.client.io.DocumentMetadataHandle;
import com.marklogic.client.io.Format;
import com.marklogic.client.io.InputStreamHandle;
import com.marklogic.hub.MarkLogicVersion;
import com.marklogic.hub.spark.sql.sources.v2.Options;
import org.apache.spark.sql.catalyst.InternalRow;
import org.apache.spark.sql.types.DataTypes;
import org.junit.jupiter.api.Test;

import java.text.SimpleDateFormat;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

public class ReadAllDataTypesTest extends AbstractSparkReadTest {

    @Test
    void readAllDataTypes() throws Exception {
        runAsDataHubDeveloper();
        loadTDE("User");
        runAsDataHubOperator();
        writeSingleUserToFinal();
        Options options = newOptions().withView("User").withNumPartitions("2");
        HubDataSourceReader dataSourceReader = new HubDataSourceReader(options.toDataSourceOptions());
        List<InternalRow> rows = readRows(dataSourceReader);
        assertEquals(1, rows.size());
        InternalRow row = rows.get(0);

        //The comment in the assertions will have the datatype of the property in TDE template
        assertEquals(1, row.getInt(0), "integer");
        assertEquals(1, row.getInt(1), "int");
        assertEquals(Byte.decode("1"), row.getByte(2), "byte");
        assertEquals(1, row.getInt(3), "positiveInteger");
        assertEquals(1, row.getInt(4), "nonNegativeInteger");
        assertEquals(1L, row.getLong(5), "long");
        assertEquals(1L, row.getLong(6), "unsignedLong");
        assertEquals(1L, row.getLong(7), "unsignedInt");
        assertEquals(Short.decode("1"), row.getShort(8), "short");
        assertEquals(Short.decode("1"), row.getShort(9), "unsignedByte");
        assertEquals(Short.decode("1"), row.getShort(10), "unsignedShort");
        assertEquals("John", row.getString(11), "string");
        assertEquals(6218, row.get(12, DataTypes.DateType), "date; Spark accepts java.sql.Date." +
            "1987-01-10 translates to 6218");

        final String expectedDateTimeOfBirth = "1987-01-10T12:13:14-00:00";
        final long dateTimeAsNanoseconds = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ssX").parse(expectedDateTimeOfBirth).getTime() * 1000;
        assertEquals(dateTimeAsNanoseconds, row.get(13, DataTypes.LongType), "For a timestamp, the Scala JacksonParser will " +
            "return a long value in nanoseconds corresponding to the given timestamp; ");

        assertEquals("20:12:38", row.getString(14), "time");
        assertEquals("/John/IRI", row.getString(15), "IRI");
        assertEquals("/John/IRI", row.getString(16), "anyURI");
        assertEquals(true, row.getBoolean(17), "boolean");
        assertEquals(-10, row.getInt(18), "negativeInteger");
        assertEquals(-10, row.getInt(19), "nonPositiveInteger");
        assertEquals(30.5f, row.getFloat(20), "float");
        assertEquals(30.5d, row.getDouble(21), "double");
        assertEquals(30.5d, row.getDouble(22), "decimal");
        assertEquals("1987-01", row.getString(23), "gYearMonth");
        assertEquals("1987+02:00", row.getString(24), "gYear");
        assertEquals("--01+02:00", row.getString(25), "gMonth");
        assertEquals("---10", row.getString(26), "gDay");
        assertEquals("--01-10", row.getString(27), "gMonthDay");
        assertEquals("P1M", row.getString(28), "duration");
        assertEquals("P1M", row.getString(29), "yearMonthDuration");
        assertEquals("P30DT1H", row.getString(30), "dayTimeDuration");
        assertTrue("POINT(-122.07858 37.389965)".equals(row.getString(31)) || "37.389965,-122.07858".equals(row.getString(31))  , "point");
        assertTrue("POINT(-122.07858 37.389965)".equals(row.getString(32)) || "37.389965,-122.07858".equals(row.getString(32))  , "longLatPoint");


        assertEquals("Dum spiro spero", new String(row.getBinary(33), "UTF-8"), "The Scala JacksonParser is able to " +
            "convert the value of mottoBase64 into a byte array, so we can build a String with it and assert " +
            "against the original value of that base64Binary value");
        assertEquals("44756D20737069726F20737065726F", row.getString(34), "The Scala " +
            "JacksonParser is not able to convert hexBinary values into a byte array, so the original value is " +
            "returned as a string");
    }

    private void writeSingleUserToFinal() {
        InputStreamHandle handle = new InputStreamHandle(readInputStreamFromClasspath("entityInstances/User/user1.json"));
        handle.withFormat(Format.JSON);
        getHubClient().getFinalClient().newJSONDocumentManager().write("/doc1.json", new DocumentMetadataHandle()
                .withCollections("User")
                .withPermission("data-hub-operator", DocumentMetadataHandle.Capability.READ, DocumentMetadataHandle.Capability.UPDATE),
            handle);
    }
}
