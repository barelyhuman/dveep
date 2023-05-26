// TODO: websocket server implementation
// Simpler to do HMR since each module is already different, all that changes
// is the built js bundle per island, which can be requested for
// or better notified about when it changes

/**
 *
 * Initial Idea
 *
 * Each island is already hashed by the preact-plugins
 * - if a new file is generated for an island then change it in the existing collection
 * - notify the client to switch the script src for that island,
 *
 * Required dependencies would be
 * - Name of the island
 * - Previous Hash File
 * - New Hash File
 * - A way to know that the hash changed / new file was created
 *
 * +---------------------------------------------------------------------------------------+
 *  [Server] =>=>=> [IslandCounter] =>=>=> [Client (src::counter-isHASHONE.client.js)]
 *  [Code Change] <=<=<= [Server] =>=>=> [Client (changeSrc::counter-isHASHTWO.client.js)]
 * +---------------------------------------------------------------------------------------+
 */
