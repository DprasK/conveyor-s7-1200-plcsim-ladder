import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sourceDir = path.join(root, 'source');
const checkOnly = process.argv.includes('--check');

const esc = (value) => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
const hx = (value) => value.toString(16).toUpperCase();
const access = (uid, components, scope = 'LocalVariable') => `                <Access UId="${uid}" Scope="${scope}">\n                  <Symbol>\n${components.map((name) => `                    <Component Name="${name}" />`).join('\n')}\n                  </Symbol>\n                </Access>`;

function serialNetwork(index, title, contacts, coil, coilType = 'Coil') {
  let uid = 21;
  const parts = [];
  const wires = [];
  let priorPart = null;
  for (const contact of contacts) {
    const accessId = uid++;
    const partId = uid++;
    parts.push(access(accessId, contact.path ?? [contact.name]));
    parts.push(`                <Part Name="Contact" UId="${partId}"${contact.negated ? `>\n                  <Negated Name="operand" />\n                </Part>` : ' />'}`);
    if (priorPart === null) wires.push(`                <Wire UId="${uid++}">\n                  <Powerrail />\n                  <NameCon UId="${partId}" Name="in" />\n                </Wire>`);
    else wires.push(`                <Wire UId="${uid++}">\n                  <NameCon UId="${priorPart}" Name="out" />\n                  <NameCon UId="${partId}" Name="in" />\n                </Wire>`);
    wires.push(`                <Wire UId="${uid++}">\n                  <IdentCon UId="${accessId}" />\n                  <NameCon UId="${partId}" Name="operand" />\n                </Wire>`);
    priorPart = partId;
  }
  const coilAccess = uid++;
  const coilPart = uid++;
  parts.push(access(coilAccess, [coil]));
  parts.push(`                <Part Name="${coilType}" UId="${coilPart}" />`);
  wires.push(`                <Wire UId="${uid++}">\n                  <NameCon UId="${priorPart}" Name="out" />\n                  <NameCon UId="${coilPart}" Name="in" />\n                </Wire>`);
  wires.push(`                <Wire UId="${uid++}">\n                  <IdentCon UId="${coilAccess}" />\n                  <NameCon UId="${coilPart}" Name="operand" />\n                </Wire>`);
  return compileUnit(index, title, parts, wires);
}

function timerNetwork(index) {
  const parts = [
    access(21, ['MotorCmd']),
    access(25, ['JamSensor']),
    access(29, ['JamTime']),
    '                <Part Name="Contact" UId="22" />',
    '                <Part Name="Contact" UId="26" />',
    '                <Part Name="TON" UId="30" Version="1.0">\n                  <Instance Scope="LocalVariable" UId="31">\n                    <Component Name="JamTimer" />\n                  </Instance>\n                  <TemplateValue Name="time_type" Type="Type">Time</TemplateValue>\n                </Part>',
  ];
  const wires = [
    '                <Wire UId="23"><Powerrail /><NameCon UId="22" Name="in" /></Wire>',
    '                <Wire UId="24"><IdentCon UId="21" /><NameCon UId="22" Name="operand" /></Wire>',
    '                <Wire UId="27"><NameCon UId="22" Name="out" /><NameCon UId="26" Name="in" /></Wire>',
    '                <Wire UId="28"><IdentCon UId="25" /><NameCon UId="26" Name="operand" /></Wire>',
    '                <Wire UId="32"><NameCon UId="26" Name="out" /><NameCon UId="30" Name="IN" /></Wire>',
    '                <Wire UId="33"><IdentCon UId="29" /><NameCon UId="30" Name="PT" /></Wire>',
    '                <Wire UId="35"><NameCon UId="30" Name="Q" /><OpenCon UId="34" /></Wire>',
    '                <Wire UId="37"><NameCon UId="30" Name="ET" /><OpenCon UId="36" /></Wire>',
  ];
  return compileUnit(index, '05 - TON: deteksi sensor macet saat motor berjalan', parts, wires);
}

function compileUnit(index, title, parts, wires) {
  const base = 1 + index * 3;
  return `      <SW.Blocks.CompileUnit ID="${hx(base)}" CompositionName="CompileUnits">\n        <AttributeList>\n          <NetworkSource>\n            <FlgNet xmlns="http://www.siemens.com/automation/Openness/SW/NetworkSource/FlgNet/v4">\n              <Parts>\n${parts.join('\n')}\n              </Parts>\n              <Wires>\n${wires.join('\n')}\n              </Wires>\n            </FlgNet>\n          </NetworkSource>\n          <ProgrammingLanguage>LAD</ProgrammingLanguage>\n        </AttributeList>\n        <ObjectList>\n          <MultilingualText ID="${hx(base + 1)}" CompositionName="Title">\n            <ObjectList>\n              <MultilingualTextItem ID="${hx(base + 2)}" CompositionName="Items">\n                <AttributeList><Culture>en-US</Culture><Text>${esc(title)}</Text></AttributeList>\n              </MultilingualTextItem>\n            </ObjectList>\n          </MultilingualText>\n        </ObjectList>\n      </SW.Blocks.CompileUnit>`;
}

const networks = [
  ['01 - First scan: reset run latch', [{ name: 'FirstScan' }], 'RunLatch', 'RCoil'],
  ['02 - First scan: reset fault latch', [{ name: 'FirstScan' }], 'FaultLatch', 'RCoil'],
  ['03 - E-Stop tidak sehat: latch fault', [{ name: 'EStopOK', negated: true }], 'FaultLatch', 'SCoil'],
  ['04 - Overload tidak sehat: latch fault', [{ name: 'OverloadOK', negated: true }], 'FaultLatch', 'SCoil'],
];
const units = networks.map((network, index) => serialNetwork(index, ...network));
units.push(timerNetwork(4));
units.push(serialNetwork(5, '06 - Timer macet selesai: latch fault', [{ path: ['JamTimer', 'Q'] }], 'FaultLatch', 'SCoil'));
units.push(serialNetwork(6, '07 - Reset fault hanya saat kondisi sehat', [
  { name: 'ResetButton' }, { name: 'StopOK' }, { name: 'EStopOK' }, { name: 'OverloadOK' }, { name: 'JamSensor', negated: true },
], 'FaultLatch', 'RCoil'));
units.push(serialNetwork(7, '08 - START: latch perintah jalan', [
  { name: 'StartButton' }, { name: 'StopOK' }, { name: 'EStopOK' }, { name: 'OverloadOK' }, { name: 'JamSensor', negated: true }, { name: 'FaultLatch', negated: true },
], 'RunLatch', 'SCoil'));
units.push(serialNetwork(8, '09 - STOP: reset perintah jalan', [{ name: 'StopOK', negated: true }], 'RunLatch', 'RCoil'));
units.push(serialNetwork(9, '10 - E-Stop: reset perintah jalan', [{ name: 'EStopOK', negated: true }], 'RunLatch', 'RCoil'));
units.push(serialNetwork(10, '11 - Overload: reset perintah jalan', [{ name: 'OverloadOK', negated: true }], 'RunLatch', 'RCoil'));
units.push(serialNetwork(11, '12 - Fault aktif: reset perintah jalan', [{ name: 'FaultLatch' }], 'RunLatch', 'RCoil'));
units.push(serialNetwork(12, '13 - Output motor dengan seluruh permissive', [
  { name: 'RunLatch' }, { name: 'StopOK' }, { name: 'EStopOK' }, { name: 'OverloadOK' }, { name: 'FaultLatch', negated: true },
], 'MotorCmd'));
units.push(serialNetwork(13, '14 - Lampu RUN mengikuti perintah motor', [{ name: 'MotorCmd' }], 'RunLamp'));
units.push(serialNetwork(14, '15 - Lampu FAULT mengikuti fault latch', [{ name: 'FaultLatch' }], 'FaultLamp'));

const fb = `<?xml version="1.0" encoding="utf-8"?>\n<Document>\n  <Engineering version="V16" />\n  <SW.Blocks.FB ID="0">\n    <AttributeList>\n      <AutoNumber>false</AutoNumber>\n      <Interface>\n        <Sections xmlns="http://www.siemens.com/automation/Openness/SW/Interface/v4">\n          <Section Name="Input">\n            <Member Name="FirstScan" Datatype="Bool" />\n            <Member Name="StartButton" Datatype="Bool" />\n            <Member Name="StopOK" Datatype="Bool" />\n            <Member Name="EStopOK" Datatype="Bool" />\n            <Member Name="OverloadOK" Datatype="Bool" />\n            <Member Name="JamSensor" Datatype="Bool" />\n            <Member Name="ResetButton" Datatype="Bool" />\n            <Member Name="JamTime" Datatype="Time"><StartValue>T#5s</StartValue></Member>\n          </Section>\n          <Section Name="Output">\n            <Member Name="MotorCmd" Datatype="Bool" />\n            <Member Name="RunLamp" Datatype="Bool" />\n            <Member Name="FaultLamp" Datatype="Bool" />\n          </Section>\n          <Section Name="InOut" />\n          <Section Name="Static">\n            <Member Name="RunLatch" Datatype="Bool"><StartValue>FALSE</StartValue></Member>\n            <Member Name="FaultLatch" Datatype="Bool"><StartValue>FALSE</StartValue></Member>\n            <Member Name="JamTimer" Datatype="TON_TIME" />\n          </Section>\n          <Section Name="Temp" />\n          <Section Name="Constant" />\n        </Sections>\n      </Interface>\n      <MemoryLayout>Optimized</MemoryLayout>\n      <Name>FB_Conveyor_LAD</Name>\n      <Number>2</Number>\n      <ProgrammingLanguage>LAD</ProgrammingLanguage>\n    </AttributeList>\n    <ObjectList>\n${units.join('\n')}\n    </ObjectList>\n  </SW.Blocks.FB>\n</Document>\n`;

const db = `<?xml version="1.0" encoding="utf-8"?>\n<Document>\n  <Engineering version="V16" />\n  <SW.Blocks.InstanceDB ID="0">\n    <AttributeList>\n      <AutoNumber>false</AutoNumber>\n      <InstanceOfName>FB_Conveyor_LAD</InstanceOfName>\n      <InstanceOfNumber Informative="true">2</InstanceOfNumber>\n      <InstanceOfType Informative="true">FB</InstanceOfType>\n      <Interface><Sections xmlns="http://www.siemens.com/automation/Openness/SW/Interface/v4" /></Interface>\n      <ReadOnly>false</ReadOnly>\n      <MemoryLayout>Optimized</MemoryLayout>\n      <Name>DB_Conveyor_LAD</Name>\n      <Number>2</Number>\n      <ProgrammingLanguage>DB</ProgrammingLanguage>\n    </AttributeList>\n  </SW.Blocks.InstanceDB>\n</Document>\n`;

const tags = [
  ['Conveyor_StartButton', '%I0.0'], ['Conveyor_StopOK', '%I0.1'], ['Conveyor_EStopOK', '%I0.2'],
  ['Conveyor_OverloadOK', '%I0.3'], ['Conveyor_JamSensor', '%I0.4'], ['Conveyor_ResetButton', '%I0.5'],
  ['Conveyor_MotorCmd', '%Q0.0'], ['Conveyor_RunLamp', '%Q0.1'], ['Conveyor_FaultLamp', '%Q0.2'],
];
const tagsXml = tags.map(([name, address], index) => `      <SW.Tags.PlcTag ID="${hx(index + 1)}" CompositionName="Tags">\n        <AttributeList><DataTypeName>Bool</DataTypeName><LogicalAddress>${address}</LogicalAddress><Name>${name}</Name></AttributeList>\n      </SW.Tags.PlcTag>`).join('\n');
const tagTable = `<?xml version="1.0" encoding="utf-8"?>\n<Document>\n  <Engineering version="V16" />\n  <SW.Tags.PlcTagTable ID="0">\n    <AttributeList><Name>Conveyor_IO_LAD</Name></AttributeList>\n    <ObjectList>\n${tagsXml}\n    </ObjectList>\n  </SW.Tags.PlcTagTable>\n</Document>\n`;

const globalAccess = (uid, name) => access(uid, [name], 'GlobalVariable');
const main = `<?xml version="1.0" encoding="utf-8"?>\n<Document>\n  <Engineering version="V16" />\n  <SW.Blocks.OB ID="0">\n    <AttributeList>\n      <AutoNumber>false</AutoNumber>\n      <Interface><Sections xmlns="http://www.siemens.com/automation/Openness/SW/Interface/v4"><Section Name="Input"><Member Name="Initial_Call" Datatype="Bool" Informative="true" /><Member Name="Remanence" Datatype="Bool" Informative="true" /></Section><Section Name="Temp" /><Section Name="Constant" /></Sections></Interface>\n      <MemoryLayout>Optimized</MemoryLayout><Name>Main</Name><Number>1</Number><ProgrammingLanguage>LAD</ProgrammingLanguage><SecondaryType>ProgramCycle</SecondaryType>\n    </AttributeList>\n    <ObjectList>\n      <SW.Blocks.CompileUnit ID="1" CompositionName="CompileUnits">\n        <AttributeList>\n          <NetworkSource>\n            <FlgNet xmlns="http://www.siemens.com/automation/Openness/SW/NetworkSource/FlgNet/v4">\n              <Parts>\n${access(21, ['Initial_Call'])}\n${globalAccess(22, 'Conveyor_StartButton')}\n${globalAccess(23, 'Conveyor_StopOK')}\n${globalAccess(24, 'Conveyor_EStopOK')}\n${globalAccess(25, 'Conveyor_OverloadOK')}\n${globalAccess(26, 'Conveyor_JamSensor')}\n${globalAccess(27, 'Conveyor_ResetButton')}\n${globalAccess(28, 'Conveyor_MotorCmd')}\n${globalAccess(29, 'Conveyor_RunLamp')}\n${globalAccess(30, 'Conveyor_FaultLamp')}\n                <Access UId="31" Scope="TypedConstant"><Constant><ConstantValue>T#5s</ConstantValue></Constant></Access>\n                <Call UId="32">\n                  <CallInfo Name="FB_Conveyor_LAD" BlockType="FB">\n                    <Instance Scope="GlobalVariable" UId="33"><Component Name="DB_Conveyor_LAD" /></Instance>\n+                    <Parameter Name="FirstScan" Section="Input" Type="Bool" /><Parameter Name="StartButton" Section="Input" Type="Bool" /><Parameter Name="StopOK" Section="Input" Type="Bool" /><Parameter Name="EStopOK" Section="Input" Type="Bool" /><Parameter Name="OverloadOK" Section="Input" Type="Bool" /><Parameter Name="JamSensor" Section="Input" Type="Bool" /><Parameter Name="ResetButton" Section="Input" Type="Bool" /><Parameter Name="JamTime" Section="Input" Type="Time" />\n+                    <Parameter Name="MotorCmd" Section="Output" Type="Bool" /><Parameter Name="RunLamp" Section="Output" Type="Bool" /><Parameter Name="FaultLamp" Section="Output" Type="Bool" />\n                  </CallInfo>\n                </Call>\n              </Parts>\n              <Wires>\n                <Wire UId="40"><IdentCon UId="21" /><NameCon UId="32" Name="FirstScan" /></Wire>\n                <Wire UId="41"><IdentCon UId="22" /><NameCon UId="32" Name="StartButton" /></Wire>\n                <Wire UId="42"><IdentCon UId="23" /><NameCon UId="32" Name="StopOK" /></Wire>\n                <Wire UId="43"><IdentCon UId="24" /><NameCon UId="32" Name="EStopOK" /></Wire>\n                <Wire UId="44"><IdentCon UId="25" /><NameCon UId="32" Name="OverloadOK" /></Wire>\n                <Wire UId="45"><IdentCon UId="26" /><NameCon UId="32" Name="JamSensor" /></Wire>\n                <Wire UId="46"><IdentCon UId="27" /><NameCon UId="32" Name="ResetButton" /></Wire>\n                <Wire UId="47"><IdentCon UId="31" /><NameCon UId="32" Name="JamTime" /></Wire>\n                <Wire UId="48"><NameCon UId="32" Name="MotorCmd" /><IdentCon UId="28" /></Wire>\n                <Wire UId="49"><NameCon UId="32" Name="RunLamp" /><IdentCon UId="29" /></Wire>\n                <Wire UId="50"><NameCon UId="32" Name="FaultLamp" /><IdentCon UId="30" /></Wire>\n                <Wire UId="51"><Powerrail /><NameCon UId="32" Name="en" /></Wire>\n                <Wire UId="53"><NameCon UId="32" Name="eno" /><OpenCon UId="52" /></Wire>\n              </Wires>\n            </FlgNet>\n          </NetworkSource>\n          <ProgrammingLanguage>LAD</ProgrammingLanguage>\n        </AttributeList>\n        <ObjectList><MultilingualText ID="2" CompositionName="Title"><ObjectList><MultilingualTextItem ID="3" CompositionName="Items"><AttributeList><Culture>en-US</Culture><Text>Conveyor control - cyclic LAD call</Text></AttributeList></MultilingualTextItem></ObjectList></MultilingualText></ObjectList>\n      </SW.Blocks.CompileUnit>\n    </ObjectList>\n  </SW.Blocks.OB>\n</Document>\n`;

const outputs = new Map([
  ['FB_Conveyor_LAD.xml', fb], ['DB_Conveyor_LAD.xml', db], ['Conveyor_IO_LAD.xml', tagTable], ['Main_LAD.xml', main],
]);

fs.mkdirSync(sourceDir, { recursive: true });
let mismatch = false;
for (const [name, content] of outputs) {
  const target = path.join(sourceDir, name);
  if (checkOnly) {
    if (!fs.existsSync(target) || fs.readFileSync(target, 'utf8') !== content) {
      console.error(`Out of date: source/${name}`);
      mismatch = true;
    }
  } else {
    fs.writeFileSync(target, content, 'utf8');
    console.log(`Generated source/${name}`);
  }
}
if (mismatch) process.exitCode = 1;
