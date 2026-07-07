import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards, Req } from '@nestjs/common';
import { BlogService } from './blog.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('blog')
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  // Public Endpoints
  @Get()
  getPublishedPosts() {
    return this.blogService.getPublishedPosts();
  }

  @Get('slug/:slug')
  getPostBySlug(@Param('slug') slug: string) {
    return this.blogService.getPostBySlug(slug);
  }

  // Admin Endpoints
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('admin/all')
  getAllPosts() {
    return this.blogService.getAllPosts();
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post()
  createPost(@Body() data: any, @Req() req: any) {
    // Use the admin's ID for authorId
    return this.blogService.createPost(data, req.user.id);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch(':id')
  updatePost(@Param('id') id: string, @Body() data: any) {
    return this.blogService.updatePost(id, data);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)
  @Delete(':id')
  deletePost(@Param('id') id: string) {
    return this.blogService.deletePost(id);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post('ai/enhance')
  enhanceWithAi(@Body('outline') outline: string) {
    return this.blogService.draftWithAi(outline);
  }
}
