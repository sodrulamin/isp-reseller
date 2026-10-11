package com.isp.billing.config;

import org.flywaydb.core.Flyway;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import javax.sql.DataSource;

@Configuration
public class FlywayConfig {

    private static final Logger log = LoggerFactory.getLogger(FlywayConfig.class);

    @Value("${spring.flyway.baseline-on-migrate:true}")
    private boolean baselineOnMigrate;

    @Value("${spring.flyway.baseline-version:1}")
    private String baselineVersion;

    @Value("${spring.flyway.locations:classpath:db/migration}")
    private String locations;

    @Value("${spring.flyway.enabled:true}")
    private boolean flywayEnabled;

    @Bean(initMethod = "migrate")
    public Flyway flyway(DataSource dataSource) {
        if (!flywayEnabled) {
            log.info("Flyway migration is disabled via configuration");
            return null;
        }

        log.info("Initializing Flyway database migration...");
        Flyway flyway = Flyway.configure()
                .dataSource(dataSource)
                .locations(locations)
                .baselineOnMigrate(baselineOnMigrate)
                .baselineVersion(baselineVersion)
                .load();

        log.info("Flyway configured successfully. Running migrations...");
        return flyway;
    }
}
