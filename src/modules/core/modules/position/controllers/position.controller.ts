import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  ParseEnumPipe,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiSecurity, ApiTags } from '@nestjs/swagger';
import { AccessGuard, Actions, UseAbility } from 'nest-casl';
import { AccountData } from 'src/modules/auth/decorators/account-data.decorator';

import { PositionStatusCommand } from '../consts/position-status-commands.const';
import { CreatePositionDto } from '../dto/create-position.dto';
import { UpdatePositionDto } from '../dto/update-position.dto';
import { PositionEntity } from '../entities/position.entity';
import { PositionService } from '../services/position.service';

@ApiTags('Position')
@ApiSecurity('JWT-auth')
@Controller('position')
export class PositionController {
  constructor(private readonly positionService: PositionService) {}

  @Post()
  @UseGuards(AccessGuard)
  @UseAbility(Actions.create, PositionEntity)
  createPosition(
    @AccountData() account: AccountEntityWithEmployer,
    @Body() positionDto: CreatePositionDto,
  ) {
    return this.positionService.createPosition(account.employerId, positionDto);
  }

  @Patch(':id')
  @UseGuards(AccessGuard)
  @UseAbility(Actions.update, PositionEntity)
  updatePosition(
    @Param('id') id: string,
    @AccountData() account: AccountEntityWithEmployer,
    @Body() updatePositionDto: UpdatePositionDto,
  ) {
    return this.positionService.updatePosition(
      account.employerId,
      id,
      updatePositionDto,
    );
  }

  @Patch(':id/:command')
  @HttpCode(204)
  @UseGuards(AccessGuard)
  @UseAbility(Actions.manage, PositionEntity)
  changePositionStatus(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Param('command', new ParseEnumPipe(PositionStatusCommand))
    command: PositionStatusCommand,
    @AccountData() account: AccountEntityWithEmployer,
  ): Promise<void> {
    return this.positionService.changePositionStatus(
      account.employerId,
      id,
      command,
    );
  }

  @Get(':id')
  @UseGuards(AccessGuard)
  @UseAbility(Actions.read, PositionEntity)
  getPosition(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<PositionEntity> {
    return this.positionService.getPosition(id);
  }

  @Get('')
  @UseGuards(AccessGuard)
  @UseAbility(Actions.read, PositionEntity)
  getPositions(): Promise<PositionEntity[]> {
    // TODO: Pagination with sorting and filtering.
    // TODO: Implement algorithm for rate showing.
    return this.positionService.getPositions();
  }

  @Get('p/p/p/p/p')
  @UseGuards(AccessGuard)
  @UseAbility(Actions.read, PositionEntity)
  ppp() {
    console.log('ppp');
  }
}
