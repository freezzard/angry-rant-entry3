// Angry Judge: The Short Rant Contest
// Entry program for the solo account.
//
// The program writes one short rant to /output/entry.txt.
// The rant is fixed text, built from three sentence parts below,
// checked against the competition gate, then written once.
//
// Style notes for this file:
// - Guard style: every check returns early through a named result.
// - No branch keyword for the alternative path is used anywhere.
// - Every failure travels in a named variable, never as a bare value.
// - Identifiers that carry the entry's own ideas start with rant.
// - The rant text is assembled from parts so each sentence is visible
//   on its own line and easy to count by eye.

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

// ---------------------------------------------------------------------------
// The rant itself
// ---------------------------------------------------------------------------
//
// Topic: the unsubscribe button that needs ten business days to work.
// Shape: three sentences, one line, plain ASCII, 240 to 300 characters.
// Voice: tired, specific, and annoyed at the asymmetry — signing up took
// half a second, leaving takes ten business days. The last sentence is
// the punch: the newsletter outlives the reader.

const rantSentenceOne =
  "I clicked unsubscribe once, and the reply said it takes ten business days, as if my inbox were a government office that closes for lunch.";

const rantSentenceTwo =
  "Ten business days to stop emails I never asked for, from a company that signed me up in half a second.";

const rantSentenceThree =
  "At this rate my grandkids will inherit the newsletter.";

const rantTargetMinimum = 240;
const rantTargetMaximum = 300;
const rantGateMinimum = 1;
const rantGateMaximum = 400;
const rantExpectedSentences = 3;
const rantOutputPath = "/output/entry.txt";

// ---------------------------------------------------------------------------
// Assembly
// ---------------------------------------------------------------------------

function rantJoinSentences(
  rantFirst: string,
  rantSecond: string,
  rantThird: string,
): string {
  const rantParts = [rantFirst, rantSecond, rantThird];
  const rantJoined = rantParts.join(" ");
  return rantJoined;
}

function rantAssemble(): string {
  const rantText = rantJoinSentences(
    rantSentenceOne,
    rantSentenceTwo,
    rantSentenceThree,
  );
  return rantText;
}

// ---------------------------------------------------------------------------
// Single checks
// ---------------------------------------------------------------------------

function rantCheckAscii(rantText: string): boolean {
  const rantAsciiPattern = /^[\x00-\x7F]*$/;
  const rantAsciiOk = rantAsciiPattern.test(rantText);
  return rantAsciiOk;
}

function rantCheckSingleLine(rantText: string): boolean {
  const rantHasNewline = rantText.includes("\n");
  const rantHasReturn = rantText.includes("\r");
  const rantSingleLine = rantHasNewline === false && rantHasReturn === false;
  return rantSingleLine;
}

function rantCheckNoDoubleSpace(rantText: string): boolean {
  const rantHasDoubleSpace = rantText.includes("  ");
  const rantSpacingOk = rantHasDoubleSpace === false;
  return rantSpacingOk;
}

function rantCheckEdges(rantText: string): boolean {
  const rantStartsClean = rantText.startsWith(" ") === false;
  const rantEndsClean = rantText.endsWith(" ") === false;
  const rantEdgesOk = rantStartsClean && rantEndsClean;
  return rantEdgesOk;
}

function rantCheckNotBlank(rantText: string): boolean {
  const rantTrimmed = rantText.trim();
  const rantHasContent = rantTrimmed.length > 0;
  return rantHasContent;
}

function rantCheckLength(rantText: string): boolean {
  const rantLength = rantText.length;
  const rantWithinGate =
    rantLength >= rantGateMinimum && rantLength <= rantGateMaximum;
  return rantWithinGate;
}

function rantCheckTargetLength(rantText: string): boolean {
  const rantLength = rantText.length;
  const rantWithinTarget =
    rantLength >= rantTargetMinimum && rantLength <= rantTargetMaximum;
  return rantWithinTarget;
}

function rantCheckEndsWithPeriod(rantText: string): boolean {
  const rantEndsWithPeriod = rantText.endsWith(".");
  return rantEndsWithPeriod;
}

function rantCheckSentenceGaps(rantText: string): boolean {
  const rantGapPattern = /\. [A-Z]/g;
  const rantGaps = rantText.match(rantGapPattern);
  const rantGapTotal = rantGaps === null ? 0 : rantGaps.length;
  const rantGapsOk = rantGapTotal === rantExpectedSentences - 1;
  return rantGapsOk;
}

function rantCountSentences(rantText: string): number {
  const rantChars = rantText.split("");
  const rantStops = rantChars.filter((rantChar) => {
    const rantIsStop =
      rantChar === "." || rantChar === "!" || rantChar === "?";
    return rantIsStop;
  });
  const rantSentenceTotal = rantStops.length;
  return rantSentenceTotal;
}

// ---------------------------------------------------------------------------
// Validation report
// ---------------------------------------------------------------------------

type RantReport = {
  rantOk: boolean;
  rantProblems: string[];
  rantLength: number;
  rantSentences: number;
};

function rantValidate(rantText: string): RantReport {
  const rantProblems: string[] = [];
  const rantLength = rantText.length;
  const rantSentences = rantCountSentences(rantText);

  const rantAsciiOk = rantCheckAscii(rantText);
  if (rantAsciiOk === false) {
    rantProblems.push("rant contains non-ASCII characters");
  }

  const rantSingleLine = rantCheckSingleLine(rantText);
  if (rantSingleLine === false) {
    rantProblems.push("rant spans more than one line");
  }

  const rantSpacingOk = rantCheckNoDoubleSpace(rantText);
  if (rantSpacingOk === false) {
    rantProblems.push("rant contains a double space");
  }

  const rantEdgesOk = rantCheckEdges(rantText);
  if (rantEdgesOk === false) {
    rantProblems.push("rant has a leading or trailing space");
  }

  const rantContentOk = rantCheckNotBlank(rantText);
  if (rantContentOk === false) {
    rantProblems.push("rant is blank");
  }

  const rantLengthOk = rantCheckLength(rantText);
  if (rantLengthOk === false) {
    rantProblems.push("rant length is outside the 1 to 400 gate");
  }

  const rantTargetOk = rantCheckTargetLength(rantText);
  if (rantTargetOk === false) {
    rantProblems.push("rant length is outside the 240 to 300 target");
  }

  const rantPeriodOk = rantCheckEndsWithPeriod(rantText);
  if (rantPeriodOk === false) {
    rantProblems.push("rant does not end with a period");
  }

  const rantGapsOk = rantCheckSentenceGaps(rantText);
  if (rantGapsOk === false) {
    rantProblems.push("rant sentences are not separated cleanly");
  }

  const rantSentenceOk = rantSentences === rantExpectedSentences;
  if (rantSentenceOk === false) {
    rantProblems.push("rant does not hold exactly three sentences");
  }

  const rantOk = rantProblems.length === 0;
  const rantReport: RantReport = {
    rantOk,
    rantProblems,
    rantLength,
    rantSentences,
  };
  return rantReport;
}

// ---------------------------------------------------------------------------
// Writing
// ---------------------------------------------------------------------------

function rantWrite(rantText: string): number {
  const rantReport = rantValidate(rantText);
  if (rantReport.rantOk === false) {
    const rantJoinedProblems = rantReport.rantProblems.join("; ");
    console.error(`rant validation failed: ${rantJoinedProblems}`);
    const rantFailCode = 1;
    return rantFailCode;
  }
  const rantFolder = dirname(rantOutputPath);
  mkdirSync(rantFolder, { recursive: true });
  writeFileSync(rantOutputPath, rantText, "utf8");
  const rantWrittenNote = `rant written: ${rantReport.rantLength} chars, ${rantReport.rantSentences} sentences -> ${rantOutputPath}`;
  console.log(rantWrittenNote);
  const rantSuccessCode = 0;
  return rantSuccessCode;
}

// ---------------------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------------------

function rantMain(): number {
  const rantText = rantAssemble();
  const rantExitCode = rantWrite(rantText);
  return rantExitCode;
}

try { const rantExitCode = rantMain(); process.exitCode = rantExitCode; } catch (rantFailure) {
  const rantFailureMessage =
    rantFailure instanceof Error ? rantFailure.message : String(rantFailure);
  console.error(`rant run failed: ${rantFailureMessage}`);
  process.exitCode = 1;
}
