import { Module } from '@nestjs/common';
import { OrganizerController } from './organizer.controller';

@Module({
  controllers: [OrganizerController]
})
export class OrganizerModule {}
