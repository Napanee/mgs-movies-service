import {
	Association,
	BelongsToManyAddAssociationMixin,
	BelongsToManyAddAssociationsMixin,
	BelongsToManyCountAssociationsMixin,
	BelongsToManyCreateAssociationMixin,
	BelongsToManyGetAssociationsMixin,
	BelongsToManyHasAssociationMixin,
	BelongsToManyHasAssociationsMixin,
	BelongsToManyRemoveAssociationMixin,
	BelongsToManyRemoveAssociationsMixin,
	BelongsToManySetAssociationsMixin,
	DataTypes,
	Model,
	ModelAttributes,
	Optional,
} from 'sequelize';

import Movie from './Movie';

import {sequelizeConnection} from '../connection';


interface GenreAttributes {
	id: string;
	name: string;
	tmdb: number;
}

type OptionalAttributes = 'id';

export type GenreInput = Optional<GenreAttributes, OptionalAttributes>;
export type GenreOutput = Required<GenreAttributes>;

const attributes: ModelAttributes = {
	name: {
		allowNull: false,
		type: DataTypes.STRING,
		validate: {
			notEmpty: {
				msg: 'This field cannot be empty.',
			},
		},
	},
	tmdb: {
		allowNull: false,
		type: DataTypes.INTEGER,
		validate: {
			notEmpty: {
				msg: 'This field cannot be empty.',
			},
		},
	},
};

class Genre extends Model<GenreAttributes, GenreInput> implements GenreAttributes {
	declare id: string;
	declare name: string;
	declare tmdb: number;

	declare readonly createdAt: Date;
	declare readonly updatedAt: Date;

	declare getMovies: BelongsToManyGetAssociationsMixin<Movie>;
	declare setMovies: BelongsToManySetAssociationsMixin<Movie, string>;
	declare addMovies: BelongsToManyAddAssociationsMixin<Movie, string>;
	declare addMovie: BelongsToManyAddAssociationMixin<Movie, string>;
	declare createMovie: BelongsToManyCreateAssociationMixin<Movie>;
	declare removeMovie: BelongsToManyRemoveAssociationMixin<Movie, string>;
	declare removeMovies: BelongsToManyRemoveAssociationsMixin<Movie, string>;
	declare hasMovie: BelongsToManyHasAssociationMixin<Movie, string>;
	declare hasMovies: BelongsToManyHasAssociationsMixin<Movie, string>;
	declare countMovies: BelongsToManyCountAssociationsMixin;

	declare readonly movies?: Movie[];

	declare static associations: {
		movies: Association<Genre, Movie>;
	};
}

Genre.init(attributes, {sequelize: sequelizeConnection});

export default Genre;
