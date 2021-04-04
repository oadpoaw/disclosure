import { ColumnType, ExtractColumnType, FunctionProvider, StoreProvider } from '../StoreProvider';
import { DisclosureError } from '../../DisclosureError';
import { validate } from '../util/validate';

export function Sequelize(uri: string): FunctionProvider {
    try {

        const sequelize = require('sequelize') as typeof import('sequelize');

        const connection = new sequelize.Sequelize(uri, { logging: false });

        connection.sync().then(() => connection.authenticate()).catch(console.error);

        const provider: FunctionProvider = <T extends ColumnType>(s: string, t: T) => {

            const type =
                t === 'boolean' ? sequelize.DataTypes.BOOLEAN :
                    t === 'number' ? sequelize.DataTypes.INTEGER :
                        t === 'string' ? sequelize.DataTypes.STRING : undefined;

            const model = connection.define(s, {
                key: sequelize.DataTypes.STRING,
                value: type,
            }, { timestamps: false });

            model.sync();

            return new class extends StoreProvider {

                async get(k: string): Promise<ExtractColumnType<T>> {
                    const inst = await model.findOne({ where: { key: k } });
                    if (inst) return inst.getDataValue('value');
                    return undefined;
                }

                async set(k: string, v: ExtractColumnType<T>) {
                    validate(v, t);
                    const inst = await model.findOne({ where: { key: k } });
                    if (inst) await inst.update({ value: v }, { where: { key: v } });
                    else await model.create({ key: k, value: v });
                }

                async del(k: string) {
                    return !!(await model.destroy({ where: { key: k } }));
                }

            };
        };

        return provider;

    } catch (_err) {
        throw new DisclosureError(`Please install \'sequelize\' manually.`);
    }
}