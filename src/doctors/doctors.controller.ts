import { Controller, Get, Param, Query } from '@nestjs/common';
import { DoctorsService } from './doctors.service.js';

@Controller('doctors')
export class DoctorsController {
  constructor(private readonly doctorsService: DoctorsService) {}

  @Get()
  findAll(@Query('specialty') specialty?: string) {
    return this.doctorsService.findAll(specialty);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.doctorsService.findOne(id);
  }
}
