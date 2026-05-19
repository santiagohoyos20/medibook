import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { DoctorsService } from './doctors.service.js';

@ApiTags('doctors')
@Controller('doctors')
export class DoctorsController {
  constructor(private readonly doctorsService: DoctorsService) {}

  @ApiQuery({ name: 'specialty', required: false })
  @Get()
  findAll(@Query('specialty') specialty?: string) {
    return this.doctorsService.findAll(specialty);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.doctorsService.findOne(id);
  }
}
