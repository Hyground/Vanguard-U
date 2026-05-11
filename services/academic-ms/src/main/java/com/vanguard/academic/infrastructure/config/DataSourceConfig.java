package com.vanguard.academic.infrastructure.config;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import java.util.EnumMap;
import java.util.Map;
import javax.sql.DataSource;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.jdbc.datasource.LazyConnectionDataSourceProxy;
import org.springframework.transaction.annotation.EnableTransactionManagement;

@Configuration
@EnableTransactionManagement
public class DataSourceConfig {

    @Bean
    public DataSource writeDataSource(
            @Value("${DB_WRITE_HOST:${DB_HOST:vps.wissegt.com}}") String host,
            @Value("${DB_WRITE_PORT:${DB_PORT:5432}}") int port,
            @Value("${DB_NAME:bdedu}") String database,
            @Value("${DB_USERNAME:bd2equipomari}") String username,
            @Value("${DB_PASSWORD}") String password,
            @Value("${DB_POOL_MAX_SIZE:10}") int maximumPoolSize,
            @Value("${DB_POOL_MIN_IDLE:2}") int minimumIdle,
            @Value("${DB_CONNECTION_TIMEOUT_MS:30000}") long connectionTimeout,
            @Value("${DB_IDLE_TIMEOUT_MS:600000}") long idleTimeout,
            @Value("${DB_MAX_LIFETIME_MS:1800000}") long maxLifetime) {
        return createDataSource(
                "academic-write-pool",
                host,
                port,
                database,
                username,
                password,
                maximumPoolSize,
                minimumIdle,
                connectionTimeout,
                idleTimeout,
                maxLifetime,
                false);
    }

    @Bean
    public DataSource readDataSource(
            @Value("${DB_READ_HOST:${DB_WRITE_HOST:${DB_HOST:vps.wissegt.com}}}") String host,
            @Value("${DB_READ_PORT:${DB_WRITE_PORT:${DB_PORT:5432}}}") int port,
            @Value("${DB_NAME:bdedu}") String database,
            @Value("${DB_USERNAME:bd2equipomari}") String username,
            @Value("${DB_PASSWORD}") String password,
            @Value("${DB_READ_POOL_MAX_SIZE:${DB_POOL_MAX_SIZE:10}}") int maximumPoolSize,
            @Value("${DB_READ_POOL_MIN_IDLE:${DB_POOL_MIN_IDLE:2}}") int minimumIdle,
            @Value("${DB_CONNECTION_TIMEOUT_MS:30000}") long connectionTimeout,
            @Value("${DB_IDLE_TIMEOUT_MS:600000}") long idleTimeout,
            @Value("${DB_MAX_LIFETIME_MS:1800000}") long maxLifetime) {
        return createDataSource(
                "academic-read-pool",
                host,
                port,
                database,
                username,
                password,
                maximumPoolSize,
                minimumIdle,
                connectionTimeout,
                idleTimeout,
                maxLifetime,
                true);
    }

    @Bean
    @Primary
    public DataSource dataSource(
            @Qualifier("writeDataSource") DataSource writeDataSource,
            @Qualifier("readDataSource") DataSource readDataSource,
            @Value("${app.datasource.read-replica.enabled:true}") boolean readReplicaEnabled) {
        ReplicationRoutingDataSource routingDataSource = new ReplicationRoutingDataSource(readReplicaEnabled);
        Map<ReplicationRoutingDataSource.DataSourceType, DataSource> targetDataSources =
                new EnumMap<>(ReplicationRoutingDataSource.DataSourceType.class);
        targetDataSources.put(ReplicationRoutingDataSource.DataSourceType.WRITE, writeDataSource);
        targetDataSources.put(ReplicationRoutingDataSource.DataSourceType.READ, readDataSource);
        routingDataSource.setTargetDataSources(Map.copyOf(targetDataSources));
        routingDataSource.setDefaultTargetDataSource(writeDataSource);
        routingDataSource.afterPropertiesSet();

        return new LazyConnectionDataSourceProxy(routingDataSource);
    }

    private DataSource createDataSource(
            String poolName,
            String host,
            int port,
            String database,
            String username,
            String password,
            int maximumPoolSize,
            int minimumIdle,
            long connectionTimeout,
            long idleTimeout,
            long maxLifetime,
            boolean readOnly) {
        HikariConfig config = new HikariConfig();
        config.setPoolName(poolName);
        config.setJdbcUrl("jdbc:postgresql://" + host + ":" + port + "/" + database);
        config.setUsername(username);
        config.setPassword(password);
        config.setDriverClassName("org.postgresql.Driver");
        config.setMaximumPoolSize(maximumPoolSize);
        config.setMinimumIdle(minimumIdle);
        config.setConnectionTimeout(connectionTimeout);
        config.setIdleTimeout(idleTimeout);
        config.setMaxLifetime(maxLifetime);
        config.setReadOnly(readOnly);
        config.setInitializationFailTimeout(0);
        return new HikariDataSource(config);
    }
}
