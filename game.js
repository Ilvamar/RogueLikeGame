var WIDTH = 40;
var HEIGHT = 24;
var map = [];
var rooms = [];
var items = [];
var hero = { health: 100, maxHealth: 100, attack: 10 };
var enemies = [];
var level = 1;

function init() {
    generateMap();
    placeItems();
    placeHero();
    placeEnemies();
    render();
}

function resetLevel(){
    map = [];
    rooms = [];
    items = [];
    enemies = [];
    hero.health = hero.maxHealth;
}

function generateMap() {
    var y, x, i;
    for (y = 0; y < HEIGHT; y++) {
        map[y] = [];
        for (x = 0; x < WIDTH; x++) {
            map[y][x] = 0;
        }
    }


    var numRooms = Math.floor(Math.random() * 6) + 5;
    for (i = 0; i < numRooms; i++) {
        var w = Math.floor(Math.random() * 6) + 3;
        var h = Math.floor(Math.random() * 6) + 3;
        var rx = Math.floor(Math.random() * (WIDTH - w - 1)) + 1;
        var ry = Math.floor(Math.random() * (HEIGHT - h - 1)) + 1;

        var overlap = false;
        for (var r = 0; r < rooms.length; r++) {
            var room = rooms[r];
            if (rx < room.x + room.w + 1 && rx + w > room.x - 1 && ry < room.y + room.h + 1 && ry + h > room.y - 1) {
                overlap = true;
                break;
            }
        }
        if (overlap) {
            i--;
            continue;
        }

        for (y = ry; y < ry + h; y++) {
            for (x = rx; x < rx + w; x++) {
                map[y][x] = 1;
            }
        }
        rooms.push({
            x: rx,
            y: ry,
            w: w,
            h: h,
            center: { x: Math.floor(rx + w / 2), y: Math.floor(ry + h / 2) }
        });
    }

    shuffle(rooms);
    for (i = 0; i < rooms.length - 1; i++) {
        var c1 = rooms[i].center;
        var c2 = rooms[i + 1].center;
        if (Math.random() < 0.5) {
            for (x = Math.min(c1.x, c2.x); x <= Math.max(c1.x, c2.x); x++) {
                map[c1.y][x] = 1;
            }
            for (y = Math.min(c1.y, c2.y); y <= Math.max(c1.y, c2.y); y++) {
                map[y][c2.x] = 1;
            }
        } else {
            for (y = Math.min(c1.y, c2.y); y <= Math.max(c1.y, c2.y); y++) {
                map[y][c1.x] = 1;
            }
            for (x = Math.min(c1.x, c2.x); x <= Math.max(c1.x, c2.x); x++) {
                map[c2.y][x] = 1;
            }
        }
    }

    var numHor = Math.floor(Math.random() * 3) + 3;
    for (i = 0; i < numHor; i++) {
        y = Math.floor(Math.random() * HEIGHT);
        for (x = 0; x < WIDTH; x++) {
            map[y][x] = 1;
        }
    }

    var numVer = Math.floor(Math.random() * 3) + 3;
    for (i = 0; i < numVer; i++) {
        x = Math.floor(Math.random() * WIDTH);
        for (y = 0; y < HEIGHT; y++) {
            map[y][x] = 1;
        }
    }

    ensureMapConnectivity();
}

function ensureMapConnectivity() {
    var visited = [];
    var y, x;
    for (y = 0; y < HEIGHT; y++) {
        visited[y] = [];
        for (x = 0; x < WIDTH; x++) {
            visited[y][x] = false;
        }
    }

    var start = rooms[0].center;
    dfs(start.y, start.x, visited);

    for (y = 0; y < HEIGHT; y++) {
        for (x = 0; x < WIDTH; x++) {
            if (map[y][x] === 1 && !visited[y][x]) {
                var nearest = findNearestVisited(x, y, visited);
                if (nearest) {
                    connectTiles(x, y, nearest.x, nearest.y);
                }
            }
        }
    }
}

function dfs(y, x, visited) {
    if (x < 0 || x >= WIDTH || y < 0 || y >= HEIGHT || visited[y][x] || map[y][x] === 0) return;
    visited[y][x] = true;
    dfs(y - 1, x, visited);
    dfs(y + 1, x, visited);
    dfs(y, x - 1, visited);
    dfs(y, x + 1, visited);
}

function findNearestVisited(x, y, visited) {
    var minDist = Infinity;
    var nearest = null;
    for (var ny = 0; ny < HEIGHT; ny++) {
        for (var nx = 0; nx < WIDTH; nx++) {
            if (visited[ny][nx]) {
                var dist = Math.abs(nx - x) + Math.abs(ny - y);
                if (dist < minDist) {
                    minDist = dist;
                    nearest = { x: nx, y: ny };
                }
            }
        }
    }
    return nearest;
}

function connectTiles(x1, y1, x2, y2) {
    var x, y;
    if (Math.random() < 0.5) {
        for (x = Math.min(x1, x2); x <= Math.max(x1, x2); x++) {
            map[y1][x] = 1;
        }
        for (y = Math.min(y1, y2); y <= Math.max(y1, y2); y++) {
            map[y][x2] = 1;
        }
    } else {
        for (y = Math.min(y1, y2); y <= Math.max(y1, y2); y++) {
            map[y][x1] = 1;
        }
        for (x = Math.min(x1, x2); x <= Math.max(x1, x2); x++) {
            map[y2][x] = 1;
        }
    }
}

function shuffle(array) {
    var i, j, temp;
    for (i = array.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        temp = array[j];
        array[j] = array[i];
        array[i] = temp;
    }
}

function getRandomFloor() {
    var x, y;
    do {
        x = Math.floor(Math.random() * WIDTH);
        y = Math.floor(Math.random() * HEIGHT);
    } while (map[y][x] !== 1);
    return { x: x, y: y };
}

function placeItems() {
    placeRandomItem('sword', 2);
    placeRandomItem('healPotion', 9+level);
    placeRandomItem('healthUp', 1);
}

function placeRandomItem(type, count) {
    var i, pos;
    for (i = 0; i < count; i++) {
        pos = getRandomFloor();
        while (isOccupied(pos.x, pos.y)) {
            pos = getRandomFloor();
        }
        items.push({ type: type, x: pos.x, y: pos.y });
    }
}

function placeHero() {
    var pos = getRandomFloor();
    while (isOccupied(pos.x, pos.y)) {
        pos = getRandomFloor();
    }
    hero.x = pos.x;
    hero.y = pos.y;
}

function placeEnemies() {
    var i, pos;
    for (i = 0; i < 9 + level; i++) {
        pos = getRandomFloor();
        while (isOccupied(pos.x, pos.y)) {
            pos = getRandomFloor();
        }
        if(i < 10)
            enemies.push({ x: pos.x, y: pos.y, health: 50, maxHealth: 50, attack: 5, typ: 1});
        else if (i < 14)
            enemies.push({ x: pos.x, y: pos.y, health: 100, maxHealth: 100, attack: 9, typ: 2});
        else
            enemies.push({ x: pos.x, y: pos.y, health: 250, maxHealth: 250, attack: 20, typ: 3, rangeAttTimer: 0});
    }
}

function isOccupied(x, y) {
    if (hero.x === x && hero.y === y) return true;
    for (var i = 0; i < enemies.length; i++) {
        if (enemies[i].x === x && enemies[i].y === y) return true;
    }
    return false;
}

function render() {
    $('.field').empty();
    var y, x, tile, i, hp;
    for (y = 0; y < HEIGHT; y++) {
        for (x = 0; x < WIDTH; x++) {
            tile = $('<div class="tile"></div>');
            if (map[y][x] === 0) {
                tile.addClass('wall');
            } else {
                tile.addClass('floor');
                for (i = 0; i < items.length; i++) {
                    if (items[i].x === x && items[i].y === y) {
                        var itemDiv = $('<div class="item ' + items[i].type + '"></div>');
                        tile.append(itemDiv);
                    }
                }
                if (hero.x === x && hero.y === y) {
                    var entityDiv = $('<div class="entity hero"></div>');
                    hp = (hero.health / hero.maxHealth) * 100;
                    entityDiv.append('<div class="health" style="width: ' + hp + '%;"></div>');
                    tile.append(entityDiv);
                }
                for (i = 0; i < enemies.length; i++) {
                    if (enemies[i].x === x && enemies[i].y === y) {
                        if(enemies[i].typ == 1)
                            var entityDiv = $('<div class="entity enemy1"></div>');
                        else if(enemies[i].typ == 2)
                            var entityDiv = $('<div class="entity enemy2"></div>');
                        else if(enemies[i].typ == 3)
                            var entityDiv = $('<div class="entity enemy3"></div>');
                        hp = (enemies[i].health / enemies[i].maxHealth) * 100;
                        entityDiv.append('<div class="health" style="width: ' + hp + '%;"></div>');
                        tile.append(entityDiv);
                    }
                }
            }
            $('.field').append(tile);
        }
    }
}

function isAdjacent(a, b) {
    var dx = Math.abs(a.x - b.x);
    var dy = Math.abs(a.y - b.y);
    return (dx === 1 && dy === 0) || (dx === 0 && dy === 1);
}

function enemiesTurn() {
    var i, d, dirs, nx, ny;
    for (i = 0; i < enemies.length; i++) {
        var en = enemies[i];
        if(enemyDist(en, hero) <= 5 ){
            dx = hero.x - en.x;
            dy = hero.y - en.y;
            if (Math.abs(dx) > Math.abs(dy)){
                nx = en.x + (dx >0 ? 1 : -1);
                ny = en.y;
            } else {
                nx = en.x;
                ny = en.y + (dy >0 ? 1 : -1);
            }
            if (nx >= 0 && nx < WIDTH && ny >= 0 && ny < HEIGHT && map[ny][nx] === 1 && !isOccupied(nx, ny)) {
                    en.x = nx;
                    en.y = ny;
            }
            if(en.typ == 3 && enemyDist(en, hero) <= 3){
                if(en.rangeAttTimer == 0){
                    hero.health -= en.attack;
                    en.rangeAttTimer = 2;
                } else
                    en.rangeAttTimer--;
            }

            if (isAdjacent(en, hero)) {
                hero.health -= en.attack;
                if (hero.health <= 0) {
                    alert('Игра окончена!');
                    level = 1;
                    resetLevel();
                    init();
                }
            }
        } else {
            dirs = [{dx: -1, dy: 0}, {dx: 1, dy: 0}, {dx: 0, dy: -1}, {dx: 0, dy: 1}];
            shuffle(dirs);
            for (d = 0; d < dirs.length; d++) {
                nx = en.x + dirs[d].dx;
                ny = en.y + dirs[d].dy;
                if (nx >= 0 && nx < WIDTH && ny >= 0 && ny < HEIGHT && map[ny][nx] === 1 &&!isOccupied(nx, ny)) {
                    en.x = nx;
                    en.y = ny;
                    break;
                }
            }
        }
    }
}

function attackEnemies() {
    var dirs = [{dx: -1, dy: 0}, {dx: 1, dy: 0}, {dx: 0, dy: -1}, {dx: 0, dy: 1}];
    var d, nx, ny, i;
    for (d = 0; d < dirs.length; d++) {
        nx = hero.x + dirs[d].dx;
        ny = hero.y + dirs[d].dy;
        for (i = 0; i < enemies.length; i++) {
            if (enemies[i].x === nx && enemies[i].y === ny) {
                enemies[i].health -= hero.attack;
                if (enemies[i].health <= 0) {
                    enemies.splice(i, 1);
                    i--;
                }
                break;
            }
        }
    }
    if (enemies.length === 0) {
        alert(`Уровень ${level} пройден.`);
        level++;
        resetLevel();
        init();
    }
}

function enemyDist(pos1, pos2){
    return Math.abs(pos1.x - pos2.x) + Math.abs(pos1.y - pos2.y);
}

$(document).ready(function() {
    init();
    $(document).keydown(function(e) {
        var dx = 0, dy = 0;
        if (e.keyCode === 87) dy = -1;
        if (e.keyCode === 83) dy = 1;
        if (e.keyCode === 65) dx = -1;
        if (e.keyCode === 68) dx = 1;
        if (dx !== 0 || dy !== 0) {
            var nx = hero.x + dx;
            var ny = hero.y + dy;
            if (nx >= 0 && nx < WIDTH && ny >= 0 && ny < HEIGHT && map[ny][nx] === 1 &&
                !isOccupied(nx, ny)) {
                hero.x = nx;
                hero.y = ny;
                var itemIndex = -1;
                for (var i = 0; i < items.length; i++) {
                    if (items[i].x === nx && items[i].y === ny) {
                        itemIndex = i;
                        break;
                    }
                }
                if (itemIndex !== -1) {
                    var it = items[itemIndex];
                    if (it.type === 'healPotion') {
                        hero.health = Math.min(hero.health + 50, hero.maxHealth);
                    } else if (it.type === 'sword') {
                        hero.attack += 5;
                    } else if (it.type === 'healthUp'){
                        hero.maxHealth += 35;
                    }
                    items.splice(itemIndex, 1);
                }
                enemiesTurn();
                render();
            }
        } else if (e.keyCode === 32) {
            attackEnemies();
            enemiesTurn();
            render();
        }
    });
});