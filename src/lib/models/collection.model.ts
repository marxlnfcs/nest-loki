import Loki, {Collection} from "lokijs";

export class LokiJSDatabase extends Loki {}
export class LokiJSCollection<Entity extends object = any> extends Collection {}