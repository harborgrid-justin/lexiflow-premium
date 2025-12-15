import { Injectable } from '@nestjs/common';

@Injectable()
export class IntegrationsService {
findById(id: string) {
throw new Error('Method not implemented.');
}
delete(id: string) {
throw new Error('Method not implemented.');
}
connect(id: string, arg1: { accessToken: string; refreshToken: string; }) {
throw new Error('Method not implemented.');
}
disconnect(id: string) {
throw new Error('Method not implemented.');
}
refreshCredentials(id: string) {
throw new Error('Method not implemented.');
}
sync(id: string) {
throw new Error('Method not implemented.');
}
setSyncEnabled(id: string, arg1: boolean) {
throw new Error('Method not implemented.');
}
updateConfig(id: string, newConfig: { clientId: string; }) {
throw new Error('Method not implemented.');
}
findByType(arg0: string) {
throw new Error('Method not implemented.');
}
findByProvider(arg0: string) {
throw new Error('Method not implemented.');
}
testConnection(id: string) {
throw new Error('Method not implemented.');
}
getSyncHistory(id: string) {
throw new Error('Method not implemented.');
}
  async findAll(): Promise<any[]> { return []; }
  async findOne(id: string): Promise<any> { return {}; }
  async create(createDto: any, p0: string): Promise<any> { return {}; }
  async update(id: string, updateDto: any): Promise<any> { return {}; }
  async remove(id: string): Promise<void> {}
}
