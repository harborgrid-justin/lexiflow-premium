import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { KnowledgeService } from './knowledge.service';
import { KnowledgeArticle } from './entities/knowledge-article.entity';
import { EntityNotFoundException } from '../common/exceptions';
import { CreateKnowledgeArticleDto, UpdateKnowledgeArticleDto } from './dto';

describe('KnowledgeService', () => {
  let service: KnowledgeService;
  let repository: Repository<KnowledgeArticle>;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        KnowledgeService,
        {
          provide: getRepositoryToken(KnowledgeArticle),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<KnowledgeService>(KnowledgeService);
    repository = module.get<Repository<KnowledgeArticle>>(
      getRepositoryToken(KnowledgeArticle),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new article', async () => {
      const createDto: CreateKnowledgeArticleDto = {
        title: 'Test Article',
        content: 'Test content',
        category: 'General',
        tags: ['test'],
        status: 'published',
        authorId: 'user-123',
      };

      const mockArticle = {
        id: 'article-123',
        ...createDto,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepository.create.mockReturnValue(mockArticle);
      mockRepository.save.mockResolvedValue(mockArticle);

      const result = await service.create(createDto);

      expect(mockRepository.create).toHaveBeenCalledWith(createDto);
      expect(mockRepository.save).toHaveBeenCalledWith(mockArticle);
      expect(result).toEqual(mockArticle);
    });
  });

  describe('findOne', () => {
    it('should return an article if found', async () => {
      const mockArticle = {
        id: 'article-123',
        title: 'Test Article',
        viewCount: 5,
      };

      mockRepository.findOne.mockResolvedValue(mockArticle);
      mockRepository.save.mockResolvedValue({
        ...mockArticle,
        viewCount: 6,
      });

      const result = await service.findOne('article-123');

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'article-123' },
      });
      expect(result.viewCount).toBe(6);
    });

    it('should throw EntityNotFoundException if article not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('non-existent')).rejects.toThrow(
        EntityNotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update an article', async () => {
      const updateDto: UpdateKnowledgeArticleDto = {
        title: 'Updated Title',
      };

      const existingArticle = {
        id: 'article-123',
        title: 'Old Title',
        viewCount: 5,
      };

      const updatedArticle = {
        ...existingArticle,
        ...updateDto,
      };

      mockRepository.findOne.mockResolvedValue(existingArticle);
      mockRepository.save
        .mockResolvedValueOnce(existingArticle) // for findOne increment
        .mockResolvedValueOnce(updatedArticle); // for update

      const result = await service.update('article-123', updateDto);

      expect(result.title).toBe('Updated Title');
    });
  });

  describe('remove', () => {
    it('should remove an article', async () => {
      const mockArticle = {
        id: 'article-123',
        title: 'Test Article',
      };

      mockRepository.findOne.mockResolvedValue(mockArticle);
      mockRepository.save.mockResolvedValue(mockArticle);
      mockRepository.remove.mockResolvedValue(mockArticle);

      await service.remove('article-123');

      expect(mockRepository.remove).toHaveBeenCalledWith(mockArticle);
    });
  });

  describe('search', () => {
    it('should search articles', async () => {
      const mockArticles = [
        { id: '1', title: 'Test 1' },
        { id: '2', title: 'Test 2' },
      ];

      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(mockArticles),
      };

      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.search('test');

      expect(result).toEqual(mockArticles);
      expect(mockQueryBuilder.where).toHaveBeenCalled();
    });
  });
});
