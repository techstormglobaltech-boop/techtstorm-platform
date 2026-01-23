import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { EventsService } from './events.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get()
  findAll() {
    return this.eventsService.findAll();
  }

  @Get('upcoming')
  findUpcoming() {
    return this.eventsService.findUpcoming();
  }

  @UseGuards(AuthGuard('jwt'))
  @Post()
  create(@Request() req, @Body() data: any) {
    return this.eventsService.create(data, req.user.role);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch(':id')
  update(@Request() req, @Param('id') id: string, @Body() data: any) {
    return this.eventsService.update(id, data, req.user.role);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  remove(@Request() req, @Param('id') id: string) {
    return this.eventsService.remove(id, req.user.role);
  }
}
