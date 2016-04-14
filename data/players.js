var query = require('./data').query;

/**
 * Get a player by id
 * @param {Number} id Player id
 * @returns {Promise}
 */
function getPlayerById(id) {

}

/**
 * Create a new player
 * @param {string} userId User id
 * @param {string} name Player name
 * @param {string} race Player race id
 * @param {string} position Player position id
 * @param {string} teamId Team id
 * @returns {Promise}
 */
function addNewPlayer (userId, playerName, raceId, positionId, teamId) {
    let insertPlayer = {
        name : 'addNewPlayer',
        text : `INSERT INTO player (name, race, position, team, createdBy, createdDate)
                    VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING *;`,
        values : [playerName, raceId, positionId, teamId, userId]
    };
    let updateTeam = {
        name : 'deductCostOfNewPlayer',
        text : `UPDATE team SET treasury = treasury - (SELECT cost FROM position WHERE position.id = $1)
                    WHERE team.id = $2;`,
        values : [positionId, teamId]
    };
    return query(updateTeam).then(() => {
        return query(insertPlayer).then((results) => {
            if (!results || results.rows.length !== 1) {
                throw new Error('add new player failed');
            }
            return results.rows[0];
        });
    });
}

function getPlayersByTeamId (teamId) {
    let ps = {
        name : 'getPlayersByTeamId',
        text : 'SELECT * FROM player WHERE team = $1',
        values : [teamId]
    };
    return query(ps).then((results) => {
        if (!results) {
            throw new Error('get players by team id failed');
        }
        return results.rows;
    });
}

module.exports = {
    getPlayerById : getPlayerById,
    addNewPlayer : addNewPlayer,
    getPlayersByTeamId : getPlayersByTeamId
};