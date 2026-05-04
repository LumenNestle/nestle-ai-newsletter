import { Test, TestingModule } from '@nestjs/testing';
import { PermissionCacheService } from './permission-cache.service';
import { PrismaService } from '../../../prisma/prisma.service';
import { Role } from '../enum/roles';

describe('PermissionCacheService', () => {
  let service: PermissionCacheService;
  let prisma: PrismaService;

  const mockPrismaService = {
    role_permissions: {
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PermissionCacheService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<PermissionCacheService>(PermissionCacheService);
    prisma = module.get<PrismaService>(PrismaService);
    
    // Clear mock between tests
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getPermissionsForRole', () => {
    it('should fetch permissions from prisma and cache them', async () => {
      const mockPermissions = [
        { permissions: { code: 'PERM1' } },
        { permissions: { code: 'PERM2' } },
      ];
      mockPrismaService.role_permissions.findMany.mockResolvedValue(mockPermissions);

      const result = await service.getPermissionsForRole(Role.USER);

      expect(result).toEqual(['PERM1', 'PERM2']);
      expect(prisma.role_permissions.findMany).toHaveBeenCalledWith({
        where: { role: Role.USER },
        include: { permissions: true },
      });
    });

    it('should return cached permissions on subsequent calls', async () => {
      const mockPermissions = [
        { permissions: { code: 'PERM1' } },
        { permissions: { code: 'PERM2' } },
      ];
      mockPrismaService.role_permissions.findMany.mockResolvedValue(mockPermissions);

      // First call
      await service.getPermissionsForRole(Role.USER);
      expect(prisma.role_permissions.findMany).toHaveBeenCalledTimes(1);

      mockPrismaService.role_permissions.findMany.mockClear();
      
      // Second call
      const result = await service.getPermissionsForRole(Role.USER);

      expect(result).toEqual(['PERM1', 'PERM2']);
      expect(prisma.role_permissions.findMany).not.toHaveBeenCalled();
    });

    it('should fetch again after cache is cleared', async () => {
      mockPrismaService.role_permissions.findMany.mockResolvedValue([{ permissions: { code: 'NEW_PERM' } }]);

      // Fill cache
      await service.getPermissionsForRole(Role.USER);
      expect(prisma.role_permissions.findMany).toHaveBeenCalledTimes(1);

      service.clearCache();
      
      const result = await service.getPermissionsForRole(Role.USER);

      expect(result).toEqual(['NEW_PERM']);
      expect(prisma.role_permissions.findMany).toHaveBeenCalledTimes(2);
    });
  });
});
