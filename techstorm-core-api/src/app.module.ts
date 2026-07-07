import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { CourseModule } from './course/course.module';
import { ContentModule } from './content/content.module';
import { EventsModule } from './events/events.module';
import { MeetingsModule } from './meetings/meetings.module';
import { ReportsModule } from './reports/reports.module';
import { StudentsModule } from './students/students.module';
import { AdminModule } from './admin/admin.module';
import { AiModule } from './ai/ai.module';
import { PublicModule } from './public/public.module';
import { GalleryModule } from './gallery/gallery.module';
import { MailModule } from './mail/mail.module';
import { InvitationsModule } from './invitations/invitations.module';
import { UsersModule } from './users/users.module';
import { TestimonialsModule } from './testimonials/testimonials.module';
import { SponsorsModule } from './sponsors/sponsors.module';
import { ScheduleModule } from '@nestjs/schedule';
import { NewslettersModule } from './newsletters/newsletters.module';
import { BlogModule } from './blog/blog.module';
import { LegalModule } from './legal/legal.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    HttpModule,
    PrismaModule,
    AuthModule,
    CourseModule,
    ContentModule,
    EventsModule,
    MeetingsModule,
    ReportsModule,
    StudentsModule,
    AdminModule,
    AiModule,
    PublicModule,
    GalleryModule,
    MailModule,
    InvitationsModule,
    UsersModule,
    TestimonialsModule,
    SponsorsModule,
    NewslettersModule,
    BlogModule,
    LegalModule,
    ScheduleModule.forRoot(),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}