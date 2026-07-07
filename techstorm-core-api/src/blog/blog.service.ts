import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AiService } from '../ai/ai.service';

@Injectable()
export class BlogService {
  constructor(
    private prisma: PrismaService,
    private aiService: AiService,
  ) {}

  async getPublishedPosts() {
    return this.prisma.blogPost.findMany({
      where: { isPublished: true },
      orderBy: { publishedAt: 'desc' },
      include: { author: { select: { name: true, image: true, title: true } } },
    });
  }

  async getPostBySlug(slug: string) {
    const post = await this.prisma.blogPost.findUnique({
      where: { slug },
      include: { author: { select: { name: true, image: true, title: true, bio: true, twitterUrl: true, linkedinUrl: true } } },
    });
    if (!post) throw new NotFoundException('Blog post not found');
    return post;
  }

  // Admin Endpoints
  async getAllPosts() {
    return this.prisma.blogPost.findMany({
      orderBy: { createdAt: 'desc' },
      include: { author: { select: { name: true } } },
    });
  }

  async createPost(data: any, authorId: string) {
    // Basic slug generation from title
    let slug = data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    
    // Check if slug exists
    const existing = await this.prisma.blogPost.findUnique({ where: { slug } });
    if (existing) {
      slug = `${slug}-${Date.now()}`;
    }

    return this.prisma.blogPost.create({
      data: {
        ...data,
        slug,
        authorId,
        publishedAt: data.isPublished ? new Date() : null,
      },
    });
  }

  async updatePost(id: string, data: any) {
    const post = await this.prisma.blogPost.findUnique({ where: { id } });
    if (!post) throw new NotFoundException('Post not found');

    const updateData: any = { ...data };
    if (data.isPublished && !post.isPublished) {
      updateData.publishedAt = new Date();
    } else if (data.isPublished === false) {
      updateData.publishedAt = null;
    }

    return this.prisma.blogPost.update({
      where: { id },
      data: updateData,
    });
  }

  async deletePost(id: string) {
    return this.prisma.blogPost.delete({ where: { id } });
  }

  // AI Assistant endpoint for the Admin editor
  async draftWithAi(outline: string) {
    // Instead of adding a dedicated AI method, we just use the existing HTTP service or prompt
    // Assuming AiService has a method or we build one here.
    // For now, let's call the generic generation endpoint on HuggingFace through AiService.
    return this.aiService.enhanceBlog(outline);
  }
}
