import {DataTypes, Model, ModelAttributes} from 'sequelize';

import Movie from './Movie';
import Person from './Person';

import {sequelizeConnection} from '../connection';


export interface MoviePeopleAttributes {
	creditId: string;
	department: string;
	movieId: string;
	personId: string;
	character?: string | null;
	order?: number | null;
}

export type MoviePeopleInput = Required<MoviePeopleAttributes>;

const attributes: ModelAttributes = {
	movieId: {
		allowNull: false,
		type: DataTypes.UUID,
	},
	personId: {
		allowNull: false,
		type: DataTypes.UUID,
	},
	character: {
		type: DataTypes.STRING,
	},
	creditId: {
		allowNull: false,
		type: DataTypes.STRING,
	},
	department: {
		allowNull: false,
		type: DataTypes.STRING,
	},
	order: {
		type: DataTypes.INTEGER,
	},
};

class MoviePeople extends Model<MoviePeopleAttributes, MoviePeopleInput> implements MoviePeopleAttributes {
	declare movieId: string;
	declare personId: string;
	declare character?: string;
	declare creditId: string;
	declare department: string;
	declare order?: number;

	declare readonly createdAt: Date;
	declare readonly updatedAt: Date;
}

MoviePeople.init(attributes, {sequelize: sequelizeConnection, modelName: 'MoviePeople'});

Movie.belongsToMany(Person, {through: MoviePeople, as: 'cast', foreignKey: 'movieId', otherKey: 'personId'});
Person.belongsToMany(Movie, {through: MoviePeople, as: 'filmography', foreignKey: 'personId', otherKey: 'movieId'});

Person.hasMany(MoviePeople, {as: 'movieData'});
Movie.hasMany(MoviePeople, {as: 'castData'});

export default MoviePeople;
