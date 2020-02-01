"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function main(param) {
    var scene = new g.Scene({
        game: g.game,
        // このシーンで利用するアセットのIDを列挙し、シーンに通知します
        assetIds: ["player", "shot", "se"]
    });
    var time = 60; // 制限時間
    if (param.sessionParameter.totalTimeLimit) {
        time = param.sessionParameter.totalTimeLimit; // セッションパラメータで制限時間が指定されたらその値を使用します
    }
    // 市場コンテンツのランキングモードでは、g.game.vars.gameState.score の値をスコアとして扱います
    g.game.vars.gameState = { score: 0 };
    scene.loaded.add(function () {
        // ここからゲーム内容を記述します
		// ここからゲーム内容を記述します
		var bgRect = new g.FilledRect({
			scene: scene,
			cssColor: "white",
			width: g.game.width,
			height: g.game.height
		});
		scene.append(bgRect);

		var blackRect = new g.FilledRect({
			scene: scene,
			cssColor: "black",
			x: 112,
			y: 112,
			width: 64,
			height: 64,
			angle: 30,
			scaleX: 1.5,
			scaleY: 1.5,
			anchorX: 0.5,
			anchorY: 0.5
		});
		scene.append(blackRect);

		// プレイヤーを生成します
		var player = new g.Sprite({
			scene: scene,
			src: scene.assets["player"],
			width: 32,
			height: 32,
			x: 16,
			y: 16
		});
		blackRect.append(player);

		var point = blackRect.localToGlobal({x: 16, y: 16});
		var player2 = new g.Sprite({
			scene: scene,
			src: scene.assets["player"],
			width: 32,
			height: 32,
			x: point.x,
            y: point.y,
            angle: 30,
			scaleX: 1.5,
			scaleY: 1.5
		});
        scene.append(player2);

        // フォントの生成
        var font = new g.DynamicFont({
            game: g.game,
            fontFamily: g.FontFamily.Serif,
            size: 48
        });
        // スコア表示用のラベル
        var scoreLabel = new g.Label({
            scene: scene,
            text: "SCORE: 0",
            font: font,
            fontSize: font.size / 2,
            textColor: "black",
            scaleX: 2,
			scaleY: 2
        });
        scene.append(scoreLabel);
        // 残り時間表示用ラベル
        var timeLabel = new g.Label({
            scene: scene,
            text: "TIME: 0",
            font: font,
            fontSize: font.size / 2,
            textColor: "black",
            x: 0.7 * g.game.width
        });
        scene.append(timeLabel);
        // 画面をタッチしたとき、SEを鳴らします
        scene.pointDownCapture.add(function () {
            // 制限時間以内であればタッチ1回ごとにSCOREに+1します
            if (time > 0) {
                g.game.vars.gameState.score++;
                scoreLabel.text = "SCORE: " + g.game.vars.gameState.score;
                scoreLabel.invalidate();
            }
            scene.assets["se"].play();
            // プレイヤーが発射する弾を生成します
            var shot = new g.Sprite({
                scene: scene,
                src: scene.assets["shot"],
                width: scene.assets["shot"].width,
                height: scene.assets["shot"].height
            });
            // 弾の初期座標を、プレイヤーの少し右に設定します
            shot.x = player2.x + player2.scaleX * player2.width;
            shot.y = player2.y;
            shot.update.add(function () {
                // 毎フレームで座標を確認し、画面外に出ていたら弾をシーンから取り除きます
                if (shot.x > g.game.width)
                    shot.destroy();
                // 弾を右に動かし、弾の動きを表現します
                shot.x += 10;
                // 変更をゲームに通知します
                shot.modified();
            });
            scene.append(shot);
        });
        var updateHandler = function () {
            if (time <= 0) {
                // RPGアツマール環境であればランキングを表示します
                if (param.isAtsumaru) {
                    var boardId_1 = 1;
                    window.RPGAtsumaru.experimental.scoreboards.setRecord(boardId_1, g.game.vars.gameState.score).then(function () {
                        window.RPGAtsumaru.experimental.scoreboards.display(boardId_1);
                    });
                }
                scene.update.remove(updateHandler); // カウントダウンを止めるためにこのイベントハンドラを削除します
            }
            // カウントダウン処理
            time -= 1 / g.game.fps;
            timeLabel.text = "TIME: " + Math.ceil(time);
            timeLabel.invalidate();
        };
        scene.update.add(updateHandler);
        // ここまでゲーム内容を記述します
    });
    g.game.pushScene(scene);
}
exports.main = main;
