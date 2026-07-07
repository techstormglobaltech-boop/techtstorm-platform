import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards, Req, UnauthorizedException } from '@nestjs/common';
import { BlogService } from './blog.service';
import { AuthGuard } from '@nestjs/passport';

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
  @UseGuards(AuthGuard('jwt'))
  @Get('admin/all')
  getAllPosts(@Req() req: any) {
    if (req.user.role !== 'ADMIN' && req.user.role !== 'SUPER_ADMIN') throw new UnauthorizedException('Admin only');
    return this.blogService.getAllPosts();
  }

  @UseGuards(AuthGuard('jwt'))
  @Post()
  createPost(@Body() data: any, @Req() req: any) {
    if (req.user.role !== 'ADMIN' && req.user.role !== 'SUPER_ADMIN') throw new UnauthorizedException('Admin only');
    return this.blogService.createPost(data, req.user.id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch(':id')
  updatePost(@Param('id') id: string, @Body() data: any, @Req() req: any) {
    if (req.user.role !== 'ADMIN' && req.user.role !== 'SUPER_ADMIN') throw new UnauthorizedException('Admin only');
    return this.blogService.updatePost(id, data);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  deletePost(@Param('id') id: string, @Req() req: any) {
    if (req.user.role !== 'ADMIN' && req.user.role !== 'SUPER_ADMIN') throw new UnauthorizedException('Admin only');
    return this.blogService.deletePost(id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('ai/enhance')
  enhanceWithAi(@Body('outline') outline: string, @Req() req: any) {
    if (req.user.role !== 'ADMIN' && req.user.role !== 'SUPER_ADMIN') throw new UnauthorizedException('Admin only');
    return this.blogService.draftWithAi(outline);
  }
}
