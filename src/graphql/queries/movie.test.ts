import supertest from 'supertest';

import {GenreOutput} from '@models/Genre';
import {MovieOutput} from '@models/Movie';
import {PersonOutput} from '@models/Person';
import app from '@src/app';

import GenreResolver from '../resolvers/Genre';
import MovieResolver, {IArgsList, IListResponse} from '../resolvers/Movie';
import PersonResolver from '../resolvers/Person';


const genreList = [...Array(10)].map((_, index): GenreOutput => ({
	id: `${index}`,
	name: `Foo${index}`,
	tmdb: index,
}));

const peopleList = [...Array(10)].map((_, index): PersonOutput => ({
	biography: null,
	birthday: null,
	deathday: null,
	id: `${index}`,
	image: null,
	imdb: `tt${index}`,
	name: `Foo${index}`,
	placeOfBirth: null,
	tmdb: index,
}));

const movieList = [...Array(10)].map((_, index): MovieOutput => ({
	id: `${index}`,
	imdb: `tt${index}`,
	releaseDate: '2022-01-01',
	title: `Foo${index}`,
	titleOriginal: `Foo${index}`,
	tmdb: index,
	backdrop: null,
	overview: null,
	poster: null,
	runtime: null,
}));

describe('The movie query', () => {
	const request = supertest(app);

	test('should response single movie with id', async () => {
		const movie = movieList[0];
		const mockFn = jest.spyOn(MovieResolver.prototype, 'get').mockResolvedValue(movie);
		const expectedResponse = {movie: {title: movie.title}};
		const query = `{
			movie(id: 1) {
				title
			}
		}`;

		const response = await request.post('/graphql').send({query});

		expect(MovieResolver.prototype.get).toHaveBeenCalledTimes(1);
		expect(response.body.data).toEqual(expectedResponse);

		mockFn.mockRestore();
	});

	test('should response single movie with title', async () => {
		const movie = movieList[0];
		const mockFn = jest.spyOn(MovieResolver.prototype, 'get').mockResolvedValue(movie);
		const expectedResponse = {movie: {title: movie.title}};
		const query = `{
			movie(id: "${movie.title}") {
				title
			}
		}`;

		const response = await request.post('/graphql').send({query});

		expect(MovieResolver.prototype.get).toHaveBeenCalledTimes(1);
		expect(response.body.data).toEqual(expectedResponse);

		mockFn.mockRestore();
	});

	test('should response movie list', async () => {
		type ListSpy = (args: IArgsList) => Promise<IListResponse>;

		const mockFn = jest.spyOn(MovieResolver.prototype, 'list') as unknown as jest.MockedFunction<ListSpy>;

		mockFn.mockResolvedValue({
			edges: movieList.map((node) => ({node})),
			pageInfo: {
				hasNextPage: () => true,
				hasPreviousPage: () => false,
			},
			totalCount: 10,
		});
		const expectedResponse = {
			movies: {
				edges: movieList.map((node) => ({node: {title: node.title}})),
			},
		};
		const query = `{
			movies {
				edges {
					node {
						title
					}
				}
			}
		}`;

		const response = await request.post('/graphql').send({query});

		expect(MovieResolver.prototype.list).toHaveBeenCalledTimes(1);
		expect(response.body.data).toEqual(expectedResponse);

		mockFn.mockRestore();
	});

	test('should response genre with movies', async () => {
		type ListSpy = (args: IArgsList, plain: boolean) => Promise<MovieOutput[]>;

		const genre = genreList[0];
		// eslint-disable-next-line max-len
		const mockFnMovieResolver = jest.spyOn(MovieResolver.prototype, 'list') as unknown as jest.MockedFunction<ListSpy>;
		const mockFnGenreResolver = jest.spyOn(GenreResolver.prototype, 'get').mockResolvedValue(genre);

		mockFnMovieResolver.mockResolvedValue(movieList);
		const expectedResponse = {
			genre: {
				name: genre.name,
				movies: movieList.map((movie) => ({title: movie.title})),
			},
		};
		const query = `{
			genre(id: 1) {
				name
				movies {
					title
				}
			}
		}`;

		const response = await request.post('/graphql').send({query});

		expect(MovieResolver.prototype.list).toHaveBeenCalledTimes(1);
		expect(GenreResolver.prototype.get).toHaveBeenCalledTimes(1);
		expect(response.body.data).toEqual(expectedResponse);

		mockFnGenreResolver.mockRestore();
		mockFnMovieResolver.mockRestore();
	});

	test('should response actors with movies', async () => {
		type ListSpy = (args: IArgsList, plain: boolean) => Promise<MovieOutput[]>;

		const person = peopleList[0];
		// eslint-disable-next-line max-len
		const mockFnMovieResolver = jest.spyOn(MovieResolver.prototype, 'list') as unknown as jest.MockedFunction<ListSpy>;
		const mockFnPersonResolver = jest.spyOn(PersonResolver.prototype, 'get').mockResolvedValue(person);

		mockFnMovieResolver.mockResolvedValue(movieList.map((movie) => ({
			...movie,
			character: 'character',
		})));
		const expectedResponse = {
			person: {
				name: person.name,
				filmography: movieList.map((movie) => ({
					character: 'character',
					title: movie.title,
				})),
			},
		};
		const query = `{
			person(id: 1) {
				name
				filmography {
					... on filmographyActorNode {
						character
						title
					}
				}
			}
		}`;

		const response = await request.post('/graphql').send({query});

		expect(MovieResolver.prototype.list).toHaveBeenCalledTimes(1);
		expect(PersonResolver.prototype.get).toHaveBeenCalledTimes(1);
		expect(response.body.data).toEqual(expectedResponse);

		mockFnPersonResolver.mockRestore();
		mockFnMovieResolver.mockRestore();
	});

	test('should response directors with movies', async () => {
		type ListSpy = (args: IArgsList, plain: boolean) => Promise<MovieOutput[]>;

		const person = peopleList[0];
		// eslint-disable-next-line max-len
		const mockFnMovieResolver = jest.spyOn(MovieResolver.prototype, 'list') as unknown as jest.MockedFunction<ListSpy>;
		const mockFnPersonResolver = jest.spyOn(PersonResolver.prototype, 'get').mockResolvedValue(person);

		mockFnMovieResolver.mockResolvedValue(movieList.map((movie) => movie));
		const expectedResponse = {
			person: {
				name: person.name,
				filmography: movieList.map((movie) => ({title: movie.title})),
			},
		};
		const query = `{
			person(id: 1) {
				name
				filmography {
					... on filmographyDirectorNode {
						title
					}
				}
			}
		}`;

		const response = await request.post('/graphql').send({query});

		expect(MovieResolver.prototype.list).toHaveBeenCalledTimes(1);
		expect(PersonResolver.prototype.get).toHaveBeenCalledTimes(1);
		expect(response.body.data).toEqual(expectedResponse);

		mockFnPersonResolver.mockRestore();
		mockFnMovieResolver.mockRestore();
	});
});
