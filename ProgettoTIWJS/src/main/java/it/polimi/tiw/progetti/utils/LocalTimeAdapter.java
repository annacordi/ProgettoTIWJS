package it.polimi.tiw.progetti.utils;

import com.google.gson.TypeAdapter;
import com.google.gson.stream.JsonReader;
import com.google.gson.stream.JsonWriter;

import java.io.IOException;
import java.time.LocalTime;

public class LocalTimeAdapter extends TypeAdapter<LocalTime> {

    @Override
    public void write(JsonWriter out, LocalTime value) throws IOException {
        out.value(value.toString()); // es: "13:45:30"
    }

    @Override
    public LocalTime read(JsonReader in) throws IOException {
        return LocalTime.parse(in.nextString());
    }
}
