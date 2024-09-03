import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongoClient } from 'mongodb';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { LoggingInterceptor } from './logging.interceptor';
import { APP_INTERCEPTOR } from '@nestjs/core';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env.example' }),
    UserModule,
    PrometheusModule.register(),
    MongooseModule.forRootAsync({
      useFactory: async (configService: ConfigService) => {
        const url = `mongodb://${configService.get('MONGO_USERNAME')}:${configService.get('MONGO_PASSWORD')}@${configService.get('MONGO_HOSTNAME')}:${configService.get('MONGO_PORT')}/${configService.get('MONGO_DB')}? ${configService.get('MONGO_REPLICASET') ? `replicaSet=${configService.get('MONGO_REPLICASET')}&` : ''}`;

        console.log(url);
        // const client = new MongoClient(url);
        // await client.connect();
        // await client.db('admin').command({ ping: 1 });
        console.log('Connected successfully to server');
        return {
          uri: `mongodb://${configService.get('MONGO_HOSTNAME')}:${configService.get('MONGO_PORT')}`,
          replicaSet: configService.get<string>('MONGO_REPLICASET'),

          dbName: configService.get<string>('MONGO_DB'),
          auth: {
            username: configService.get<string>('MONGO_USERNAME'),
            password: configService.get<string>('MONGO_PASSWORD'),
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
  ],
})
export class AppModule {}
