package com.vanguard.academic.infrastructure.config;

import org.springframework.jdbc.datasource.lookup.AbstractRoutingDataSource;
import org.springframework.transaction.support.TransactionSynchronizationManager;

public class ReplicationRoutingDataSource extends AbstractRoutingDataSource {

    private final boolean readReplicaEnabled;

    public ReplicationRoutingDataSource(boolean readReplicaEnabled) {
        this.readReplicaEnabled = readReplicaEnabled;
    }

    @Override
    protected Object determineCurrentLookupKey() {
        if (readReplicaEnabled && TransactionSynchronizationManager.isCurrentTransactionReadOnly()) {
            return DataSourceType.READ;
        }
        return DataSourceType.WRITE;
    }

    public enum DataSourceType {
        WRITE,
        READ
    }
}
