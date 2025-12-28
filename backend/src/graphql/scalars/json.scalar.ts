import { Scalar, CustomScalar } from '@nestjs/graphql';
import { Kind, ValueNode, ObjectValueNode, ObjectFieldNode } from 'graphql';

// JSON-compatible value types
export type JSONValue =
  | string
  | number
  | boolean
  | null
  | JSONObject
  | JSONArray;

export interface JSONObject {
  [key: string]: JSONValue;
}

export interface JSONArray extends Array<JSONValue> {}

@Scalar('JSON')
export class JSONScalar implements CustomScalar<JSONValue, JSONValue> {
  description = 'JSON custom scalar type';

  parseValue(value: unknown): JSONValue {
    return value;
  }

  serialize(value: unknown): JSONValue {
    return value;
  }

  parseLiteral(ast: ValueNode): JSONValue {
    switch (ast.kind) {
      case Kind.STRING:
      case Kind.BOOLEAN:
        return ast.value;
      case Kind.INT:
      case Kind.FLOAT:
        return parseFloat(ast.value);
      case Kind.OBJECT:
        return this.parseObject(ast as ObjectValueNode);
      case Kind.LIST:
        return ast.values.map((n) => this.parseLiteral(n));
      case Kind.NULL:
        return null;
      default:
        return null;
    }
  }

  private parseObject(ast: ObjectValueNode): JSONObject {
    const value = Object.create(null) as JSONObject;
    ast.fields.forEach((field: ObjectFieldNode) => {
      value[field.name.value] = this.parseLiteral(field.value);
    });
    return value;
  }
}
