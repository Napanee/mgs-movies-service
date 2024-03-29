import {FindAndCountOptions, Sequelize} from 'sequelize';

import {sequelizeConnection} from '@db/connection';
import {Genre as ModelGenre, Movie as ModelMovie} from '@db/models';

import GenreController from './Genre';

import {GenresOrderByEnumType} from '../queries/Genre';


const nullableMovieProperties = {overview: null, runtime: null, backdrop: null, poster: null};

describe('The genre resolver', () => {
	const db: Sequelize = sequelizeConnection;
	const genreResolver = new GenreController();

	beforeAll(async () => {
		await db.sync({alter: true, force: true});

		const genres = await ModelGenre.bulkCreate([
			{name: 'Foo', tmdb: 1},
			{name: 'Bar', tmdb: 2},
			{name: 'Baz', tmdb: 3},
		]);

		const movie = await ModelMovie.create({
			...nullableMovieProperties,
			tmdb: 1,
			imdb: 'tt1',
			title: 'Foo',
			releaseDate: '2022-01-01',
			titleOriginal: 'Foo',
		});

		await movie.addGenres(genres);
	});

	afterAll(async () => {
		await db.close();
	});

	test('should throw error with multiple arguments', async () => {
		const error = 'You can only search by one attribute.';

		await expect(genreResolver.get({id: 1, name: 'Foo'})).rejects.toThrow(error);
	});

	test('should throw error without any argument', async () => {
		const error = 'You must enter at least one attribute.';

		await expect(genreResolver.get({})).rejects.toThrow(error);
	});

	test('should response single genre with id', async () => {
		const expectedResponse = {name: 'Bar'};

		await expect(genreResolver.get({id: 2})).resolves.toMatchObject(expectedResponse);
	});

	test('should response single genre with name', async () => {
		const expectedResponse = {id: 2};

		await expect(genreResolver.get({name: 'Bar'})).resolves.toMatchObject(expectedResponse);
	});

	test('should response genre list', async () => {
		const expectedResponse = {
			edges: [
				{node: expect.objectContaining({name: 'Bar'})},
				{node: expect.objectContaining({name: 'Baz'})},
				{node: expect.objectContaining({name: 'Foo'})},
			],
		};
		const args: FindAndCountOptions = {
			limit: 3,
			offset: 0,
			order: [GenresOrderByEnumType.getValue('NAME_ASC')?.value],
		};

		await expect(genreResolver.list(args)).resolves
			.toMatchObject(expectedResponse);
	});

	test('should response genre list with desc ordering', async () => {
		const expectedResponse = {
			edges: [
				{node: expect.objectContaining({name: 'Foo'})},
				{node: expect.objectContaining({name: 'Baz'})},
				{node: expect.objectContaining({name: 'Bar'})},
			],
		};
		const args = {
			limit: 3,
			offset: 0,
			order: [GenresOrderByEnumType.getValue('NAME_DESC')?.value],
		};

		await expect(genreResolver.list(args)).resolves
			.toMatchObject(expectedResponse);
	});

	test('should response genre list with next pages', async () => {
		const args = {
			limit: 1,
			offset: 0,
			order: [GenresOrderByEnumType.getValue('NAME_ASC')?.value],
		};
		const response = await genreResolver.list(args);

		expect(response.pageInfo.hasNextPage).toBeTruthy();
		expect(response.pageInfo.hasPreviousPage).toBeFalsy();
	});

	test('should response genre list with previous pages', async () => {
		const args = {
			limit: 1,
			offset: 2,
			order: [GenresOrderByEnumType.getValue('NAME_ASC')?.value],
		};
		const response = await genreResolver.list(args);

		expect(response.pageInfo.hasNextPage).toBeFalsy();
		expect(response.pageInfo.hasPreviousPage).toBeTruthy();
	});

	test('should response plain genre list', async () => {
		const expectedResponse = [
			expect.objectContaining({name: 'Foo'}),
			expect.objectContaining({name: 'Bar'}),
			expect.objectContaining({name: 'Baz'}),
		];

		const args = {};

		await expect(genreResolver.list(args, true)).resolves
			.toMatchObject(expectedResponse);
	});
});
