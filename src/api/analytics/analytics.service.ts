import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Post } from 'src/repositories/entities';
import { Repository } from 'typeorm';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
  ) {}

  async getAnalytics({
    startDate,
    endDate,
    provinceId,
  }: {
    startDate: string;
    endDate: string;
    provinceId: string;
  }) {
    if (!provinceId) {
      const rs1 = await this.postRepository
        .createQueryBuilder('post')
        .leftJoin('post.paymentPackage', 'paymentPackage')
        .select([
          'DATE(post.publishedAt) as date',
          'SUM(paymentPackage.price) as income',
          'COUNT(post.id) as count',
        ])
        .where('post.publishedAt BETWEEN :startDate AND :endDate', {
          startDate,
          endDate,
        })
        .groupBy('DATE(post.publishedAt)')
        .orderBy('date', 'ASC')
        .getRawMany();

      const chart1 = rs1.map((r) => ({
        date: r.date,
        income: r.income,
      }));
      const chart3 = rs1.map((r) => ({
        date: r.date,
        postCount: r.count,
      }));

      const rs2 = await this.postRepository
        .createQueryBuilder('post')
        .leftJoin('post.paymentPackage', 'paymentPackage')
        .leftJoin('post.province', 'province')
        .select([
          'province.name as location',
          'SUM(paymentPackage.price) as income',
          'COUNT(post.id) as count',
        ])
        .where('post.publishedAt BETWEEN :startDate AND :endDate', {
          startDate,
          endDate,
        })
        .groupBy('location')
        .orderBy('income', 'DESC')
        .getRawMany();

      const chart2 = rs2.map((r) => ({
        location: r.location,
        income: r.income,
      }));
      const chart4 = rs2.map((r) => ({
        location: r.location,
        postCount: r.count,
      }));
      return [chart1, chart2, chart3, chart4];
    } else {
      const rs1 = await this.postRepository
        .createQueryBuilder('post')
        .leftJoin('post.province', 'province')
        .where('province.id = :provinceId', { provinceId })
        .leftJoin('post.paymentPackage', 'paymentPackage')
        .select([
          'DATE(post.publishedAt) as date',
          'SUM(paymentPackage.price) as income',
          'COUNT(post.id) as count',
        ])
        .andWhere('post.publishedAt BETWEEN :startDate AND :endDate', {
          startDate,
          endDate,
        })
        .groupBy('DATE(post.publishedAt)')
        .orderBy('date', 'ASC')
        .getRawMany();

      const chart1 = rs1.map((r) => ({
        date: r.date,
        income: r.income,
      }));
      const chart3 = rs1.map((r) => ({
        date: r.date,
        postCount: r.count,
      }));

      const rs2 = await this.postRepository
        .createQueryBuilder('post')
        .leftJoin('post.province', 'province')
        .where('province.id = :provinceId', { provinceId })
        .leftJoin('post.paymentPackage', 'paymentPackage')
        .leftJoin('post.district', 'district')
        .select([
          'district.name as location',
          'SUM(paymentPackage.price) as income',
          'COUNT(post.id) as count',
        ])
        .andWhere('post.publishedAt BETWEEN :startDate AND :endDate', {
          startDate,
          endDate,
        })
        .groupBy('location')
        .orderBy('income', 'DESC')
        .getRawMany();

      const chart2 = rs2.map((r) => ({
        location: r.location,
        income: r.income,
      }));
      const chart4 = rs2.map((r) => ({
        location: r.location,
        postCount: r.count,
      }));
      return [chart1, chart2, chart3, chart4];
    }
  }
}
