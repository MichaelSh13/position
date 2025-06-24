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
import { ApiResponse, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { AccessGuard, Actions, UseAbility } from 'nest-casl';
import { AccountData } from 'src/modules/auth/decorators/account-data.decorator';
import { IsPublic } from 'src/modules/auth/decorators/is-public.decorator';
import { Repository } from 'typeorm';

import { AccountEntity } from '../../account/entities/account.entity';
import { PositionSystemStatus } from '../consts/position-system-status.const';
import { PositionUserStatus } from '../consts/position-user-status.const';
import { CreatePositionDto } from '../dto/create-position.dto';
import { PositionInfoDto } from '../dto/position-info.dto';
import { UpdatePositionDto } from '../dto/update-position.dto';
import { PositionEntity } from '../entities/position.entity';
import { PositionService } from '../services/position.service';

@ApiTags('Position')
@ApiSecurity('JWT-auth')
@Controller('position')
export class PositionController {
  constructor(
    private readonly positionService: PositionService,

    @InjectRepository(PositionEntity)
    private readonly positionRepository: Repository<PositionEntity>,
  ) {}

  @Post()
  @UseGuards(AccessGuard)
  @UseAbility(Actions.create, PositionEntity)
  createPosition(
    @AccountData() account: AccountEntityWithEmployer,
    @Body() positionDto: CreatePositionDto,
  ) {
    return this.positionService.createPosition(account.employerId, positionDto);
  }

  @Patch(':positionId')
  @UseGuards(AccessGuard)
  @UseAbility(Actions.update, PositionEntity)
  updatePosition(
    @Param('positionId', new ParseUUIDPipe()) positionId: string,
    @AccountData() account: AccountEntityWithEmployer,
    @Body() updatePositionDto: UpdatePositionDto,
  ) {
    return this.positionService.updatePosition(
      account.employerId,
      positionId,
      updatePositionDto,
    );
  }

  @Patch(':positionId/system-status/:systemStatus')
  @HttpCode(204)
  @UseGuards(AccessGuard)
  @UseAbility(Actions.manage, PositionEntity)
  changePositionSystemStatus(
    @Param('positionId', new ParseUUIDPipe()) positionId: string,
    @Param('systemStatus', new ParseEnumPipe(PositionSystemStatus))
    systemStatus: PositionSystemStatus,
  ): Promise<void> {
    return this.positionService.changePositionSystemStatus(
      positionId,
      systemStatus,
    );
  }

  @Patch(':positionId/user-status/:userStatus')
  @HttpCode(204)
  @UseGuards(AccessGuard)
  @UseAbility(Actions.update, PositionEntity)
  changePositionUserStatus(
    @Param('positionId', new ParseUUIDPipe()) positionId: string,
    @Param('userStatus', new ParseEnumPipe(PositionUserStatus))
    userStatus: PositionUserStatus,
    @AccountData() account: AccountEntityWithEmployer,
  ): Promise<void> {
    return this.positionService.changePositionUserStatus(
      account.employerId,
      positionId,
      userStatus,
    );
  }

  @Get(':positionId')
  @IsPublic()
  getPosition(
    @Param('positionId', new ParseUUIDPipe()) positionId: string,
    @AccountData() account?: AccountEntity,
  ): Promise<PositionEntity> {
    return this.positionService.getPositionInfo(positionId, account?.id);
  }

  @Get('')
  @IsPublic()
  @ApiResponse({
    type: PositionInfoDto,
    isArray: true,
  })
  getPositions(
    @AccountData() account?: AccountEntity,
  ): Promise<PositionInfoDto[]> {
    // TODO: Pagination with sorting and filtering.
    // TODO: Implement algorithm for rate showing.
    return this.positionService.getActivePositions(account?.id);
  }
}
