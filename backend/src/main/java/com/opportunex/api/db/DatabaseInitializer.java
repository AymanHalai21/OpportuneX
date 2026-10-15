package com.opportunex.api.db;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import javax.sql.DataSource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;

/**
 * Runs /database/*.sql (packed into the jar as db/*.sql) when the app starts:
 *   01_schema.sql      tables             (CREATE TABLE IF NOT EXISTS - safe every start)
 *   02_procedures.sql  stored procedures  (DROP + CREATE - always refreshed)
 *   03_seed.sql        demo data          (only while the database has no users)
 *   04_triggers.sql    triggers           (optional - a host that forbids triggers only gets a warning)
 */
@Component
public class DatabaseInitializer implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(DatabaseInitializer.class);

    private final DataSource dataSource;
    private final boolean enabled;

    public DatabaseInitializer(DataSource dataSource, @Value("${app.db.init:true}") boolean enabled) {
        this.dataSource = dataSource;
        this.enabled = enabled;
    }

    @Override
    public void run(ApplicationArguments args) throws Exception {
        if (!enabled) {
            log.info("DB_INIT=false - skipping database scripts");
            return;
        }
        try (Connection con = dataSource.getConnection(); Statement st = con.createStatement()) {
            log.info("Preparing MySQL schema and stored procedures ...");
            runScript(st, "db/01_schema.sql", false);
            runScript(st, "db/02_procedures.sql", false);
            if (!hasUsers(st)) {
                log.info("Empty database - loading demo data (demo login: arjun@iitd.ac.in / password123)");
                runScript(st, "db/03_seed.sql", false);
            }
            runScript(st, "db/04_triggers.sql", true);
            log.info("Database is ready.");
        }
    }

    private boolean hasUsers(Statement st) throws SQLException {
        try (ResultSet rs = st.executeQuery("SELECT COUNT(*) FROM ox_users")) {
            rs.next();
            return rs.getInt(1) > 0;
        }
    }

    private void runScript(Statement st, String path, boolean optional) throws IOException, SQLException {
        String script = new String(new ClassPathResource(path).getInputStream().readAllBytes(), StandardCharsets.UTF_8);
        for (String sql : SqlScriptSplitter.split(script)) {
            try {
                st.execute(sql);
            } catch (SQLException e) {
                if (optional) {
                    log.warn("Skipped optional statement in {} ({}): {}", path, e.getErrorCode(), e.getMessage());
                } else {
                    log.error("Statement failed in {}:\n{}", path, sql);
                    throw e;
                }
            }
        }
    }
}
