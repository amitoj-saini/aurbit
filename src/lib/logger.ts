import { File, FileMode, Paths } from "expo-file-system";

export default async function appLog(logType: string, message: string, data?: any) {
    const entry =
        JSON.stringify({
            time: new Date().toISOString(),
            message,
            data
        }) + "\n";

    const file = new File(Paths.document, `${logType}.log`);

    if (!file.exists) file.create();

    const handle = file.open(FileMode.Append);

    const bytes = new TextEncoder().encode(entry);
    handle.writeBytes(bytes);
    handle.close();

    console.log(message, data);
}