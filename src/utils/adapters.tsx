import { GameStats } from "@/app/boardGame/boardGame";
import { Part } from "./Apologies/gameUtils";
import { MoveSet } from "@/app/gameBoards/sorryBoard";

export class ApologiesGameResponseAdapter {
  private raw: any;
  private snapshot: any;

  constructor(response: any) {
    this.raw = response;
    this.snapshot = response.GameSnapshot ?? response.gameSnapshot ?? {};
  }

  get viewNum(): number {
    return this.raw.ViewNum ?? 0;
  }

  get state(): string {
    return this.raw.State ?? "";
  }

  get players(): string[] {
    return this.raw.Players ?? this.raw.PlayerNames ?? [];
  }

  get gameSnapshot(): any {
    return this.snapshot;
  }

  get gameState(): string {
    return this.snapshot.GameState ?? "";
  }

  get lastDrawnCard(): string {
    return this.snapshot.LastDrawnCard ?? "";
  }

  get lastCompletedMove(): any {
    return this.snapshot.LastCompletedMove ?? null;
  }

  get turnOrder(): string[] {
    return this.snapshot.TurnOrder ?? [];
  }

  get movesets(): MoveSet[] {
    return this.snapshot.CurrentMoveset ?? []
  }

  get playerConnectionStatus(): boolean[] {
    return this.raw.PlayerConnStatus ?? this.snapshot.PlayerConnectionStatus ?? [];
  }

  get pieces(): string[][] {
    return this.snapshot.Pieces ?? [];
  }

  get snapshotViewNum(): number {
    return this.snapshot.ViewNum ?? 0;
  }

  get snapshotType(): string {
    return this.snapshot["$type"] ?? "";
  }

  get gameStats(): GameStats {
    return this.snapshot.GameStats
  }
}

export type Warp = {
  Tile: string,
  Dest: string
}

export class UpsAndDownsGameResponseAdapter {
  private raw: any;
  private snapshot: any;

  constructor(response: any) {
    this.raw = response;
    this.snapshot = response.GameSnapshot ?? response.gameSnapshot ?? {};
  }

  get viewNum(): number {
    return this.raw.ViewNum ?? 0;
  }

  get state(): string {
    return this.raw.State ?? "";
  }

  get players(): string[] {
    return this.raw.Players ?? this.raw.PlayerNames ?? [];
  }

  get gameSnapshot(): any {
    return this.snapshot;
  }

  get gameState(): string {
    return this.snapshot.GameState ?? "";
  }

  get lastDieRoll(): number {
    return this.snapshot.LastDieRoll ?? "";
  }

  get lastCompletedMove(): any {
    return this.snapshot.LastCompletedMove ?? null;
  }

  get turnOrder(): string[] {
    return this.snapshot.TurnOrder ?? [];
  }

  get playerConnectionStatus(): boolean[] {
    return this.raw.PlayerConnStatus ?? this.snapshot.PlayerConnectionStatus ?? [];
  }

  get playerLocations(): number[] {
    return this.snapshot.PlayerLocations ?? [];
  }
  
  get BoardLayout(): Warp[] {
    return this.snapshot.BoardLayout ?? []
  }

  get snapshotType(): string {
    return this.snapshot["$type"] ?? "";
  }

  get gameStats(): GameStats {
    return this.snapshot.GameStats
  }
}

export class RequestAdapter {
  private movePart: Part;
  private splitPart?: Part;

  constructor(raw: any) {
    const move = raw.move ?? raw.Move;
    const splitMove = raw.splitMove ?? raw.SplitMove;

    if (!move || !move.From || !move.To || move.Effect === undefined) {
      throw new Error("Invalid or missing move data");
    }

    // Normalize move
    this.movePart = {
      from: move.from ?? move.From,
      to: move.to ?? move.To,
      effect: move.effect ?? move.Effect,
    };

    // Normalize splitMove if present
    if (splitMove) {
      this.splitPart = {
        from: splitMove.from ?? splitMove.From,
        to: splitMove.to ?? splitMove.To,
        effect: splitMove.effect ?? splitMove.Effect,
      };
    }
  }

  getMoveFrom(): string {
    return this.movePart.from;
  }

  getMoveTo(): string {
    return this.movePart.to;
  }

  getMoveEffect(): number {
    return this.movePart.effect;
  }

  hasSplitMove(): boolean {
    return this.splitPart !== undefined;
  }

  hasMove(): boolean {
    return this.movePart !== undefined;
  }

  getSplitFrom(): string | null {
    return this.splitPart?.from ?? null;
  }

  getSplitTo(): string | null {
    return this.splitPart?.to ?? null;
  }

  getSplitEffect(): number | null {
    return this.splitPart?.effect ?? null;
  }

  getSplitMove(): Part | null {
    return this.splitPart ?? null;
  }

  getMove(): Part {
    return this.movePart;
  }
}


export class GameStatsAdapter {
  private raw: any;

  constructor(rawData: any) {
    this.raw = rawData;
  }

  public isValid(): boolean {
    return (
      Array.isArray(this.raw.MovesMade) &&
      Array.isArray(this.raw.PawnsKilled) &&
      typeof this.raw.GameTimeElapsed === "number" &&
      this.raw.MovesMade.length === 4 &&
      this.raw.PawnsKilled.length === 4 &&
      this.raw.MovesMade.every((n:number) => typeof n === "number") &&
      this.raw.PawnsKilled.every((n:number) => typeof n === "number")
    );
  }

  public toGameStats(): GameStats {
    if (!this.isValid()) {
      throw new Error("Invalid GameStats data");
    }

    return {
      movesMade: this.raw.MovesMade,
      pawnsKilled: this.raw.PawnsKilled,
      gameTimeElapsed: this.raw.GameTimeElapsed,
    };
  }
}
