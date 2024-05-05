document.addEventListener('DOMContentLoaded', () => {
const board = document.getElementById('mahjongBoard');
let selectedTile = null;

const tileTypes = [
    { name: "乔安娜", color: "red", count: 14, imageUrl: "https://raw.githubusercontent.com/patpires/jopi4m/main/1.png"},
    { name: "ジョアナ", color: "green", count: 20,  imageUrl: "https://raw.githubusercontent.com/patpires/jopi4m/main/2.png"},
    { name: "جوانا", color: "blue", count: 28, imageUrl: "https://raw.githubusercontent.com/patpires/jopi4m/main/3.png"},
    { name: "יוֹעָנָא", color: "pink", count: 28, imageUrl: "https://raw.githubusercontent.com/patpires/jopi4m/main/4.png"},
    { name: "ᎫᏝᎭᏋ", color: "gold", count: 28 ,imageUrl: "https://raw.githubusercontent.com/patpires/jopi4m/main/5.png"},
    { name: "जोआना", color: "lightyellow", count: 8, imageUrl: "https://raw.githubusercontent.com/patpires/jopi4m/main/6.png"},
    { name: "โจอานา", color: "darkred", count: 8, imageUrl: "https://raw.githubusercontent.com/patpires/jopi4m/main/7.png"},
    { name: "ꦗꦺꦴꦲꦤ꧀", color: "lightgreen", count: 4, imageUrl: "https://raw.githubusercontent.com/patpires/jopi4m/main/8.png"}
];

let tiles = [];

function initializeGame() {
    board.innerHTML = ''; // Limpa o tabuleiro
    tiles = [];
    generateTileList();
    createTiles();
    updateFreeTiles();
}

function generateTileList() {
    tileTypes.forEach((type, typeIndex) => {
        for (let i = 0; i < type.count; i++) {
            tiles.push({
                id: `${type.name}-${i}`,
                name: type.name,
                color: type.color,
                typeIndex: typeIndex,
                free: false,
                x: 0,
                y: 0,
                layer: 0,
            });
        }
    });
    shuffle(tiles);
}

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function createTiles() {
    const matrixDimensions = [
        { rows: 8, cols: 8 },
        { rows: 5, cols: 7 },
        { rows: 4, cols: 6 },
        { rows: 3, cols: 3 },
        { rows: 2, cols: 2 },
        { rows: 1, cols: 2 }
    ];
    let tileIndex = 0;

    matrixDimensions.forEach((dimension, layerIndex) => {
        const { rows, cols } = dimension;
        const offsetX = (board.offsetWidth - cols * 60) / 2;
        const offsetY = (board.offsetHeight - rows * 60) / 2;

        for (let i = 0; i < dimension.rows * dimension.cols && tileIndex < tiles.length; i++) {
            const row = Math.floor(i / cols);
            const col = i % cols;
            const x = offsetX + (col * 80);
            const y = offsetY + (row * 80);

            const tile = tiles[tileIndex++];
            tile.x = x;
            tile.y = y;
            tile.layer = layerIndex;
            createTile(tile);
        }
    });
}

    function createTile(tile) {
        const tileElement = document.createElement('div');
        tileElement.classList.add('tile');
        // Acessa o tipo de peça correto de tileTypes usando tile.typeIndex para obter a URL da imagem
        const imageUrl = tileTypes[tile.typeIndex].imageUrl;
        // Corrige a sintaxe para definir a imagem de fundo
        tileElement.style.backgroundImage = `url("${imageUrl}")`; // Correção aqui
        //console.log(imageUrl); // Isso deve mostrar a URL esperada
        tileElement.style.backgroundSize = "cover"; // Garante que a imagem cubra todo o tile
        tileElement.style.backgroundPosition = "center"; // Centraliza a imagem no tile
        tileElement.style.backgroundColor = tile.color; // Define a cor de fundo (pode ser útil para debug ou estilos adicionais)
        tileElement.style.left = `${tile.x}px`;
        tileElement.style.top = `${tile.y}px`;
        tileElement.dataset.id = tile.id;
        tileElement.dataset.layer = `${tile.layer}`;
        tile.element = tileElement;
        board.appendChild(tileElement);
    }

function updateFreeTiles() {
    tiles.forEach(tile => {
        tile.free = checkIfTileIsFree(tile);
        tile.element.dataset.free = tile.free ? "true" : "false";
        tile.element.style.opacity = tile.free ? "1" : "0.5";
        tile.element.onclick = tile.free ? () => handleTileClick(tile) : null;
    });
}


    
    function checkIfTileIsFree(tile) {
        // Assumindo que cada peça tem uma largura e altura de 60 pixels para esta lógica
        const tileWidth = 80;
        const tileHeight = 80;

        // Verifica se a peça está bloqueada por outra peça diretamente acima.
        const isBlockedAbove = tiles.some(otherTile => {
            return otherTile.layer > tile.layer && 
                   otherTile.x < tile.x + tileWidth && 
                   otherTile.x + tileWidth > tile.x && 
                   otherTile.y < tile.y + tileHeight && 
                   otherTile.y + tileHeight > tile.y;
        });

        if (isBlockedAbove) {
            return false; // A peça está bloqueada por outra acima, então não é livre.
        }

        // Verifica se a peça está livre nas laterais (esquerda ou direita).
        const isLeftFree = !tiles.some(otherTile => {
            return otherTile.layer === tile.layer && 
                   otherTile.y === tile.y && 
                   otherTile.x + tileWidth === tile.x; // Peça adjacente imediatamente à esquerda.
        });

        const isRightFree = !tiles.some(otherTile => {
            return otherTile.layer === tile.layer && 
                   otherTile.y === tile.y && 
                   tile.x + tileWidth === otherTile.x; // Peça adjacente imediatamente à direita.
        });

        return isLeftFree || isRightFree; // A peça é livre se pelo menos um lado estiver livre.
    }
  
// Funções shuffle, createTiles, createTile, updateFreeTiles, handleTileClick, checkIfTileIsFree permanecem as mesmas

    function checkGameEnd() {
        if (tiles.length === 0) {
            alert("Parabéns! Você Venceu!");
            showRestartButton();
            return;
        }

        const freeTiles = tiles.filter(tile => tile.free);
        const hasMove = freeTiles.some(tile => freeTiles.some(other => tile.name === other.name && tile.id !== other.id));

        if (!hasMove) {
            alert("Que pena, você perdeu!");
            showRestartButton();
        }
    }

    function showRestartButton() {
        const restartButton = document.createElement('button');
        restartButton.textContent = 'Jogar Novamente';
        restartButton.onclick = () => {
            board.removeChild(restartButton);
            initializeGame();
        };
        board.appendChild(restartButton);
    }

    // Modificações na função handleTileClick para incluir checkGameEnd após a remoção de peças ou atualização de peças livres
    function handleTileClick(tile) {
        const tileElement = tile.element;
        if (selectedTile === null) {
            selectedTile = tile;
            tileElement.classList.add('selected');
        } else if (selectedTile.id === tile.id) {
            // Se a mesma peça for clicada novamente, remove a seleção
            selectedTile.element.classList.remove('selected');
            selectedTile = null;
        } else if (selectedTile.name === tile.name) {
            // Se outra peça com o mesmo nome for clicada, remove ambas as peças
            selectedTile.element.classList.remove('selected');
            tileElement.remove();
            selectedTile.element.remove();
            tiles = tiles.filter(t => t.id !== selectedTile.id && t.id !== tile.id);
            selectedTile = null;
            updateFreeTiles();
            checkGameEnd(); // Verifica o fim do jogo após cada par removido
        } else {
            // Se uma peça diferente for clicada, muda a seleção
            selectedTile.element.classList.remove('selected');
            selectedTile = null;
            tileElement.classList.add('selected');
            selectedTile = tile;
        }
    }

    initializeGame(); // Inicializa o jogo
});