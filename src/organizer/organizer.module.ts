import { Module } from '@nestjs/common';
import { OrganizerController } from './organizer.controller';
import { EventsModule } from '../events/events.module';

@Module({
  imports: [EventsModule],
  controllers: [OrganizerController],
})
export class OrganizerModule {}
