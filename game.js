class CenaJogo extends Phaser.Scene {
  constructor() {
    super({ key: "CenaJogo" });
  }

  preload() {
    // Carrega as imagens e spritesheets usadas no jogo
    this.load.image("ceu", "assets/jogo/sky.png"); // Fundo do jogo
    this.load.image("plataforma", "assets/jogo/platform.png"); // Plataforma
    this.load.image("moeda", "assets/jogo/star.png"); // Moedas
    this.load.image("vitoria", "assets/inicio/victory.png"); // Tela de vitória
    this.load.image("gameOver", "assets/jogo/gameover.png"); // Tela de game over

    // Carrega o sprite do personagem
    this.load.spritesheet("dude", "assets/jogo/dude.png", {
      frameWidth: 133,
      frameHeight: 162,
    });
  }

  create() {
    // Define a cor de fundo da cena
    this.cameras.main.setBackgroundColor("#87CEEB");

    // Adiciona o fundo e ajusta o tamanho para preencher a tela
    this.fundo = this.add.image(
      this.scale.width / 2,
      this.scale.height / 2,
      "ceu"
    );
    this.fundo.setDisplaySize(this.scale.width, this.scale.height);

    // Cria as plataformas estáticas
    this.plataformas = this.physics.add.staticGroup();
    this.plataformas.create(400, 568, "plataforma").setScale(0.5).refreshBody();
    this.plataformas.create(600, 400, "plataforma").setScale(0.5).refreshBody();
    this.plataformas.create(130, 450, "plataforma").setScale(0.5).refreshBody();
    this.plataformas.create(50, 250, "plataforma").setScale(0.5).refreshBody();
    this.plataformas.create(750, 220, "plataforma").setScale(0.5).refreshBody();

    // Cria o jogador com física e define propriedades como bounce e colisão com as bordas da tela
    this.jogador = this.physics.add.sprite(400, 300, "dude");
    this.jogador.setBounce(0.2);
    this.jogador.setCollideWorldBounds(true);
    this.jogador.setScale(0.4);

    // Colisão entre o jogador e as plataformas
    this.physics.add.collider(this.jogador, this.plataformas);

    // Animações do personagem
    this.anims.create({
      key: "left",
      frames: this.anims.generateFrameNumbers("dude", { start: 0, end: 3 }),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: "turn",
      frames: [{ key: "dude", frame: 2 }],
      frameRate: 20,
    });

    this.anims.create({
      key: "right",
      frames: this.anims.generateFrameNumbers("dude", { start: 0, end: 3 }),
      frameRate: 10,
      repeat: -1,
    });

    // Captura as teclas de movimento
    this.teclas = this.input.keyboard.createCursorKeys();

    // Pontuação e exibe o texto na tela
    this.pontuacao = 0;
    this.textoPontuacao = this.add.text(16, 16, "Pontuação: 0", {
      fontSize: "32px",
      fill: "#000",
    });

    // Cria as moedas no jogo
    this.criarMoedas();

    // Adiciona uma colisão entre o jogador e o fundo para detectar game over
    this.physics.add.collider(
      this.jogador,
      this.fundo,
      this.mostrarGameOver,
      null,
      this
    );
  }

  criarMoedas() {
    // Remove moedas existentes antes de criar novas
    if (this.moedas) {
      this.moedas.clear(true, true);
    }

    // Cria um grupo de moedas com posição inicial e espaçamento
    this.moedas = this.physics.add.group({
      key: "moeda",
      repeat: 5,
      setXY: { x: 12, y: 0, stepX: 150 },
    });

    // Define o comportamento das moedas (escala e quique ao cair)
    this.moedas.children.iterate((moeda) => {
      moeda.setScale(0.1);
      moeda.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
    });

    // Adiciona colisão entre as moedas e as plataformas
    this.physics.add.collider(this.moedas, this.plataformas);

    // Adiciona a sobreposição entre o jogador e as moedas para coletá-las
    this.physics.add.overlap(
      this.jogador,
      this.moedas,
      this.coletarMoeda,
      null,
      this
    );
  }

  update() {
    // Movimentação do jogador para a esquerda
    if (this.teclas.left.isDown) {
      this.jogador.setVelocityX(-160);
      this.jogador.anims.play("left", true);
    }
    // Movimentação do jogador para a direita
    else if (this.teclas.right.isDown) {
      this.jogador.setVelocityX(160);
      this.jogador.anims.play("right", true);
    }
    // Se não estiver se movendo, fica parado
    else {
      this.jogador.setVelocityX(0);
      this.jogador.anims.play("turn");
    }

    // Pular se estiver no chão e a tecla de cima for pressionada
    if (this.teclas.up.isDown && this.jogador.body.touching.down) {
      this.jogador.setVelocityY(-330);
    }

    // Se o jogador cair da tela, ativa o game over
    if (
      !this.jogador.body.touching.down &&
      this.jogador.y >= this.scale.height
    ) {
      this.mostrarGameOver();
    }
  }

  coletarMoeda(jogador, moeda) {
    // Desativa a moeda quando coletada
    moeda.disableBody(true, true);

    // Aumenta a pontuação e atualiza o texto
    this.pontuacao += 10;
    this.textoPontuacao.setText("Pontuação: " + this.pontuacao);

    // Se atingir 100 pontos, finaliza o jogo
    if (this.pontuacao >= 100) {
      this.fimDeJogo();
    }
    // Se todas as moedas forem coletadas, cria mais
    else if (this.moedas.countActive(true) === 0) {
      this.criarMoedas();
    }
  }

  fimDeJogo() {
    // Exibe a imagem de vitória, pausa o jogo e muda a cor do jogador
    this.add
      .image(this.scale.width / 2, this.scale.height / 2, "vitoria")
      .setScale(1.2);
    this.physics.pause();
    this.jogador.setTint(0xaaaaaa);
    this.jogador.anims.play("turn");
  }

  mostrarGameOver() {
    // Exibe a imagem de game over, pausa o jogo e muda a cor do jogador
    this.add
      .image(this.scale.width / 2, this.scale.height / 2, "gameOver")
      .setScale(0.5);
    this.physics.pause();
    this.jogador.setTint(0xff0000);
    this.jogador.anims.play("turn");
  }
}

// Configuração do jogo
const config = {
  type: Phaser.AUTO, // Seleciona automaticamente WebGL ou Canvas
  width: 800, // Largura da tela
  height: 600, // Altura da tela
  physics: {
    default: "arcade", // Usa o motor de física "arcade"
    arcade: { gravity: { y: 200 }, debug: false }, // Define a gravidade e desativa a depuração
  },
  scene: [CenaJogo], // Adiciona a cena ao jogo
};

// Cria e inicia o jogo
const jogo = new Phaser.Game(config);
