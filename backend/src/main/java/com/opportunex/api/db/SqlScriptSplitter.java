package com.opportunex.api.db;

import java.util.ArrayList;
import java.util.List;

/**
 * Splits a MySQL script into single statements. Understands the mysql-client command
 * "DELIMITER $$" so the same .sql files run in Workbench, the mysql client AND Spring Boot.
 */
public final class SqlScriptSplitter {

    private SqlScriptSplitter() {
    }

    public static List<String> split(String script) {
        List<String> statements = new ArrayList<>();
        StringBuilder current = new StringBuilder();
        String delimiter = ";";

        for (String line : script.split("\\R", -1)) {
            String trimmed = line.trim();

            if (current.length() == 0) {
                if (trimmed.isEmpty() || trimmed.startsWith("--")) {
                    continue;                                   // blank line or comment between statements
                }
                if (trimmed.regionMatches(true, 0, "DELIMITER ", 0, 10)) {
                    delimiter = trimmed.substring(10).trim();   // mysql client command, not SQL
                    continue;
                }
            }

            current.append(line).append('\n');
            if (trimmed.endsWith(delimiter)) {
                String sql = current.toString().trim();
                sql = sql.substring(0, sql.length() - delimiter.length()).trim();
                if (!sql.isEmpty()) {
                    statements.add(sql);
                }
                current.setLength(0);
            }
        }

        String rest = current.toString().trim();
        if (!rest.isEmpty()) {
            statements.add(rest);
        }
        return statements;
    }
}
