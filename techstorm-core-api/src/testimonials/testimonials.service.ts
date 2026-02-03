import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTestimonialDto } from './dto/create-testimonial.dto';
import { UpdateTestimonialDto } from './dto/update-testimonial.dto';

@Injectable()
export class TestimonialsService {
  constructor(private prisma: PrismaService) {}

  create(data: CreateTestimonialDto) {
    return this.prisma.testimonial.create({ data });
  }

  findAll() {
    return this.prisma.testimonial.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  findOne(id: string) {
    return this.prisma.testimonial.findUnique({ where: { id } });
  }

  update(id: string, data: UpdateTestimonialDto) {
    return this.prisma.testimonial.update({
      where: { id },
      data,
    });
  }

  remove(id: string) {
    return this.prisma.testimonial.delete({ where: { id } });
  }
}
