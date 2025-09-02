import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from "typeorm";
import { Company } from "../../company/entities/company.entity";

@Entity({ name: 'users' })
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    user: string;

    @Column()
    password: string;

    @Column()
    permissions: string;

    @Column()
    name: string;

    // Relación: un usuario pertenece a una compañía
    @ManyToOne(() => Company, { eager: false, nullable: true })
    @JoinColumn({ name: 'company_id' })
    company?: Company;
}
