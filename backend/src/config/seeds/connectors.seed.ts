import { DataSource } from 'typeorm';
import { Connector, ConnectorType, ConnectorStatus } from '../../connectors/entities/connector.entity';

export const seedConnectors = async (dataSource: DataSource) => {
  const repository = dataSource.getRepository(Connector);
  const count = await repository.count();

  if (count > 0) {
    console.log('  ✓ Connectors already seeded');
    return;
  }

  const connectors: Partial<Connector>[] = [
    {
      name: 'Neon PostgreSQL Primary',
      type: ConnectorType.DATABASE,
      provider: 'PostgreSQL',
      connectionString: 'postgresql://neondb_owner:npg_u71zdejvgHOR@ep-morning-violet-ahjfqnv2-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
      status: ConnectorStatus.HEALTHY,
      lastSync: new Date(),
      configuration: {
        ssl: true,
        pooler: true,
      },
    },
    {
      name: 'Local MongoDB',
      type: ConnectorType.DATABASE,
      provider: 'MongoDB',
      connectionString: 'mongodb://localhost:27017/lexiflow',
      status: ConnectorStatus.INACTIVE,
      configuration: {},
    }
  ];

  await repository.save(connectors);
  console.log(`  ✓ Seeded ${connectors.length} connectors`);
};
