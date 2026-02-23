import { pool } from "../infrastructure/database/connection";

export async function clearDatabase() {
    if (process.env.IN_MEMORY_DATA === "false") {
        await pool.query(
            "TRUNCATE TABLE match_registrations, matches, group_members, groups, users CASCADE"
        );
    }
}
