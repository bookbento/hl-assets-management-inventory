import { Test, TestingModule } from '@nestjs/testing';
import { BusinessUnitController } from './business-unit.controller';

describe('BusinessUnitController', () => {
  let controller: BusinessUnitController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BusinessUnitController],
    }).compile();

    controller = module.get<BusinessUnitController>(BusinessUnitController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
