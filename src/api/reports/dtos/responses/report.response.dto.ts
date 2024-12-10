import { PostResponseDto } from 'src/api/posts/dtos/responses/post.response.dto';
import { Report } from '../../entities/report.entity';
import { EReportStatus } from '../../enums/report-status.enum';

export class ReportResponseDto {
  public id: string;
  public reason: string;
  public description: string;
  public post: PostResponseDto;
  public status: EReportStatus;

  constructor(report: Report) {
    this.id = report.id;
    this.reason = report.reason;
    this.description = report.description;
    this.post = report.post; // TODO: implement post id to show as post url
    this.status = report.status;
  }
}
