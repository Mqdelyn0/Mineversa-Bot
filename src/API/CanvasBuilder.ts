import { MessageAttachment, TextChannel } from "discord.js";
import Canvas from "canvas";
import path from "path";
import { Context } from "vm";

// Fonts
Canvas.registerFont(path.resolve(__dirname, '../../assets/Fonts/Panton-BlackCaps.otf'), { family: 'Panton' });
Canvas.registerFont(path.resolve(__dirname, '../../assets/Fonts/Panton-BlackitalicCaps.otf'), { family: 'Panton' });
Canvas.registerFont(path.resolve(__dirname, '../../assets/Fonts/Panton-LightCaps.otf'), { family: 'Panton' });
Canvas.registerFont(path.resolve(__dirname, '../../assets/Fonts/Panton-LightitalicCaps.otf'), { family: 'Panton' });

export class CanvasBuilder {
    
    private _canvas: Canvas.Canvas;
    private _context: Context;

    private _title: string;
    private _texts: string[] = [];
    private _thumbnail: string;

    public constructor(title: string, thumbnail: string) {
        this._canvas = Canvas.createCanvas(3240, 1080);
        this._context = this._canvas.getContext('2d');
        this._title = title;
        this._thumbnail = thumbnail;
    }

    public addTexts(texts: string[]) {
        for(const text of texts) {
            this._texts.push(text);
        }
    }

    public addText(text: string) {
        this._texts.push(`${text}`);
    }

    public async build(): Promise<MessageAttachment> {
        const background = await Canvas.loadImage(path.resolve(__dirname, `../../assets/Images/Canvas_Background.png`));
        this._context.drawImage(background, 0, 0, this._canvas.width, this._canvas.height);

        this._context.font = '100px "Panton Black Caps"';
        this._context.shadowColor = '#666666';
        this._context.shadowBlur = 0;
        this._context.shadowOffsetX = 7.5;
        this._context.shadowOffsetY = 7.5;
        this._context.fillStyle = '#ffffff';
        this._context.fillText(this._title, this._canvas.width / 3.3, this._canvas.height / 3.2);

        this._context.font = '72px "Panton Light Caps"';
        this._context.fillStyle = '#ffffff';
        this._context.shadowOffsetX = 3;
        this._context.shadowOffsetY = 3;

        let offset = 1;
        for(let text of this._texts) {
            this._context.fillText(text, this._canvas.width / 3.3, this._canvas.height / 3.2 + (offset * 80));
            offset++;
        }

        this._context.beginPath();
        this._context.arc((this._canvas.width / 2) - (this._canvas.width / 3), (this._canvas.height / 2), 300, 0, Math.PI * 2, true);
        this._context.closePath();
        this._context.clip();

        const image = await Canvas.loadImage(this._thumbnail);
        this._context.drawImage(image, (this._canvas.width / 2) - (this._canvas.width / 2.35), (this._canvas.height / 4.5), 600, 600);

        const attachment = new MessageAttachment(this._canvas.toBuffer(), `BuiltCanvas.png`);
        return attachment;
    }

}