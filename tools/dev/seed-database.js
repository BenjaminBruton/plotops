#!/usr/bin/env node

/**
 * PlotOps Database Seeding Script
 *
 * Seeds the database with sample film production data for development and testing.
 */

const { Client } = require('pg');
const chalk = require('chalk');
const ora = require('ora');

class DatabaseSeeder {
  constructor() {
    this.dbConfig = {
      host: 'localhost',
      port: 5432,
      user: 'postgres',
      password:
        process.env.POSTGRES_PASSWORD ||
        'your-super-secret-and-long-postgres-password',
      database: 'postgres',
    };
  }

  async run() {
    console.log(chalk.blue.bold('\n🌱 PlotOps Database Seeding\n'));

    try {
      const client = new Client(this.dbConfig);
      await client.connect();

      await this.clearExistingData(client);
      await this.seedOrganizations(client);
      await this.seedProjects(client);
      await this.seedCharacters(client);
      await this.seedScenes(client);
      await this.seedLocations(client);
      await this.seedProps(client);
      await this.seedActors(client);
      await this.seedCastingCalls(client);
      await this.linkSceneData(client);

      await client.end();

      console.log(
        chalk.green.bold('\n✅ Database seeding completed successfully!\n')
      );
      this.printSeedingSummary();
    } catch (error) {
      console.error(chalk.red.bold('\n❌ Seeding failed:'), error.message);
      process.exit(1);
    }
  }

  async clearExistingData(client) {
    const spinner = ora('Clearing existing sample data...').start();

    try {
      // Clear in reverse dependency order
      const tables = [
        'plotops.scene_props',
        'plotops.scene_locations',
        'plotops.scene_characters',
        'plotops.character_casting',
        'plotops.auditions',
        'plotops.casting_calls',
        'plotops.actors',
        'plotops.props',
        'plotops.locations',
        'plotops.scenes',
        'plotops.characters',
        'plotops.project_members',
        'plotops.projects',
        'plotops.user_profiles',
        'plotops.organizations',
      ];

      for (const table of tables) {
        await client.query(`DELETE FROM ${table} WHERE true`);
      }

      spinner.succeed('Existing sample data cleared');
    } catch (error) {
      spinner.fail('Failed to clear existing data');
      throw error;
    }
  }

  async seedOrganizations(client) {
    const spinner = ora('Seeding organizations...').start();

    try {
      const organizations = [
        {
          id: '550e8400-e29b-41d4-a716-446655440001',
          name: 'Sunset Studios',
          slug: 'sunset-studios',
          description:
            'Independent film production company specializing in dramatic features',
          contact_email: 'info@sunsetstudios.com',
          contact_phone: '+1-555-0123',
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440002',
          name: 'Moonlight Productions',
          slug: 'moonlight-productions',
          description:
            'Boutique production house for indie films and documentaries',
          contact_email: 'hello@moonlightprod.com',
          contact_phone: '+1-555-0456',
        },
      ];

      for (const org of organizations) {
        await client.query(
          `
          INSERT INTO plotops.organizations (id, name, slug, description, contact_email, contact_phone)
          VALUES ($1, $2, $3, $4, $5, $6)
        `,
          [
            org.id,
            org.name,
            org.slug,
            org.description,
            org.contact_email,
            org.contact_phone,
          ]
        );
      }

      spinner.succeed(`Organizations seeded (${organizations.length} records)`);
    } catch (error) {
      spinner.fail('Failed to seed organizations');
      throw error;
    }
  }

  async seedProjects(client) {
    const spinner = ora('Seeding projects...').start();

    try {
      const projects = [
        {
          id: '660e8400-e29b-41d4-a716-446655440001',
          organization_id: '550e8400-e29b-41d4-a716-446655440001',
          title: 'The Last Sunset',
          slug: 'the-last-sunset',
          logline:
            'A retired detective must solve one final case to save his daughter.',
          synopsis:
            'Detective John Morrison thought his days of chasing criminals were over. But when his estranged daughter becomes the target of a dangerous criminal organization, he must use all his skills for one last case.',
          genre: 'Crime Thriller',
          status: 'pre_production',
          budget_range: '$500K - $1M',
          start_date: '2024-05-01',
          end_date: '2024-07-15',
        },
        {
          id: '660e8400-e29b-41d4-a716-446655440002',
          organization_id: '550e8400-e29b-41d4-a716-446655440001',
          title: 'Coffee Shop Chronicles',
          slug: 'coffee-shop-chronicles',
          logline:
            'A romantic comedy about finding love in the most unexpected places.',
          synopsis:
            'Sarah, a workaholic lawyer, discovers that the small coffee shop she visits daily holds the key to both her happiness and a new perspective on life.',
          genre: 'Romantic Comedy',
          status: 'development',
          budget_range: '$250K - $500K',
          start_date: '2024-08-01',
          end_date: '2024-10-30',
        },
        {
          id: '660e8400-e29b-41d4-a716-446655440003',
          organization_id: '550e8400-e29b-41d4-a716-446655440002',
          title: 'Echoes of Tomorrow',
          slug: 'echoes-of-tomorrow',
          logline: 'A sci-fi drama exploring the consequences of time travel.',
          synopsis:
            'When physicist Dr. Elena Vasquez accidentally creates a time rift, she must navigate the ethical implications of changing the past while racing to prevent a catastrophic future.',
          genre: 'Science Fiction Drama',
          status: 'production',
          budget_range: '$1M - $2M',
          start_date: '2024-03-15',
          end_date: '2024-06-30',
        },
      ];

      for (const project of projects) {
        await client.query(
          `
          INSERT INTO plotops.projects (id, organization_id, title, slug, logline, synopsis, genre, status, budget_range, start_date, end_date)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        `,
          [
            project.id,
            project.organization_id,
            project.title,
            project.slug,
            project.logline,
            project.synopsis,
            project.genre,
            project.status,
            project.budget_range,
            project.start_date,
            project.end_date,
          ]
        );
      }

      spinner.succeed(`Projects seeded (${projects.length} records)`);
    } catch (error) {
      spinner.fail('Failed to seed projects');
      throw error;
    }
  }

  async seedCharacters(client) {
    const spinner = ora('Seeding characters...').start();

    try {
      const characters = [
        // The Last Sunset characters
        {
          id: '770e8400-e29b-41d4-a716-446655440001',
          project_id: '660e8400-e29b-41d4-a716-446655440001',
          name: 'John Morrison',
          description: 'Retired detective, 55, weathered but determined',
          age_range: '50-60',
          gender: 'Male',
          character_type: 'lead',
        },
        {
          id: '770e8400-e29b-41d4-a716-446655440002',
          project_id: '660e8400-e29b-41d4-a716-446655440001',
          name: 'Sarah Morrison',
          description: 'Johns daughter, 28, investigative journalist',
          age_range: '25-35',
          gender: 'Female',
          character_type: 'lead',
        },
        {
          id: '770e8400-e29b-41d4-a716-446655440003',
          project_id: '660e8400-e29b-41d4-a716-446655440001',
          name: 'Vincent Kane',
          description: 'Crime boss, 45, sophisticated and dangerous',
          age_range: '40-50',
          gender: 'Male',
          character_type: 'supporting',
        },
        // Coffee Shop Chronicles characters
        {
          id: '770e8400-e29b-41d4-a716-446655440004',
          project_id: '660e8400-e29b-41d4-a716-446655440002',
          name: 'Sarah Chen',
          description: 'Corporate lawyer, 30, ambitious but lonely',
          age_range: '28-35',
          gender: 'Female',
          character_type: 'lead',
        },
        {
          id: '770e8400-e29b-41d4-a716-446655440005',
          project_id: '660e8400-e29b-41d4-a716-446655440002',
          name: 'Marcus Rodriguez',
          description:
            'Coffee shop owner, 32, passionate about coffee and community',
          age_range: '30-38',
          gender: 'Male',
          character_type: 'lead',
        },
      ];

      for (const character of characters) {
        await client.query(
          `
          INSERT INTO plotops.characters (id, project_id, name, description, age_range, gender, character_type)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
        `,
          [
            character.id,
            character.project_id,
            character.name,
            character.description,
            character.age_range,
            character.gender,
            character.character_type,
          ]
        );
      }

      spinner.succeed(`Characters seeded (${characters.length} records)`);
    } catch (error) {
      spinner.fail('Failed to seed characters');
      throw error;
    }
  }

  async seedScenes(client) {
    const spinner = ora('Seeding scenes...').start();

    try {
      const scenes = [
        // The Last Sunset scenes
        {
          id: '880e8400-e29b-41d4-a716-446655440001',
          project_id: '660e8400-e29b-41d4-a716-446655440001',
          scene_number: '1',
          scene_name: 'Opening - Johns Retirement',
          location_name: 'Police Station - Johns Office',
          scene_type: 'interior',
          time_of_day: 'day',
          page_count: 2.5,
          description:
            'John packs up his office on his last day as a detective',
          complexity_rating: 2,
        },
        {
          id: '880e8400-e29b-41d4-a716-446655440002',
          project_id: '660e8400-e29b-41d4-a716-446655440001',
          scene_number: '2',
          scene_name: 'The Call',
          location_name: 'Johns Apartment',
          scene_type: 'interior',
          time_of_day: 'night',
          page_count: 1.75,
          description: 'John receives a frantic call from Sarah',
          complexity_rating: 3,
        },
        {
          id: '880e8400-e29b-41d4-a716-446655440003',
          project_id: '660e8400-e29b-41d4-a716-446655440001',
          scene_number: '3',
          scene_name: 'Chase Sequence',
          location_name: 'Downtown Streets',
          scene_type: 'exterior',
          time_of_day: 'night',
          page_count: 3.25,
          description: 'High-speed chase through downtown',
          complexity_rating: 5,
        },
        // Coffee Shop Chronicles scenes
        {
          id: '880e8400-e29b-41d4-a716-446655440004',
          project_id: '660e8400-e29b-41d4-a716-446655440002',
          scene_number: '1',
          scene_name: 'Morning Rush',
          location_name: 'Brew & Bean Coffee Shop',
          scene_type: 'interior',
          time_of_day: 'day',
          page_count: 2.0,
          description: 'Sarah rushes in for her usual coffee order',
          complexity_rating: 2,
        },
        {
          id: '880e8400-e29b-41d4-a716-446655440005',
          project_id: '660e8400-e29b-41d4-a716-446655440002',
          scene_number: '2',
          scene_name: 'The Spill',
          location_name: 'Brew & Bean Coffee Shop',
          scene_type: 'interior',
          time_of_day: 'day',
          page_count: 1.5,
          description: 'Sarah accidentally spills coffee on Marcus',
          complexity_rating: 3,
        },
      ];

      for (const scene of scenes) {
        await client.query(
          `
          INSERT INTO plotops.scenes (id, project_id, scene_number, scene_name, location_name, scene_type, time_of_day, page_count, description, complexity_rating)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        `,
          [
            scene.id,
            scene.project_id,
            scene.scene_number,
            scene.scene_name,
            scene.location_name,
            scene.scene_type,
            scene.time_of_day,
            scene.page_count,
            scene.description,
            scene.complexity_rating,
          ]
        );
      }

      spinner.succeed(`Scenes seeded (${scenes.length} records)`);
    } catch (error) {
      spinner.fail('Failed to seed scenes');
      throw error;
    }
  }

  async seedLocations(client) {
    const spinner = ora('Seeding locations...').start();

    try {
      const locations = [
        {
          id: '990e8400-e29b-41d4-a716-446655440001',
          project_id: '660e8400-e29b-41d4-a716-446655440001',
          name: 'Downtown Police Station',
          address: '123 Main St, Downtown, CA 90210',
          location_type: 'practical',
          status: 'approved',
          contact_name: 'Captain Rodriguez',
          contact_phone: '+1-555-0789',
          cost_per_day: 500.0,
          parking_info: 'Street parking available, 2-hour limit',
          power_info: 'Standard 110V outlets available',
          permits_required: true,
        },
        {
          id: '990e8400-e29b-41d4-a716-446655440002',
          project_id: '660e8400-e29b-41d4-a716-446655440001',
          name: 'Johns Apartment Building',
          address: '456 Oak Ave, Residential District, CA 90211',
          location_type: 'practical',
          status: 'booked',
          contact_name: 'Building Manager',
          contact_phone: '+1-555-0456',
          cost_per_day: 300.0,
          parking_info: 'Resident parking garage available',
          power_info: 'Full electrical access',
        },
        {
          id: '990e8400-e29b-41d4-a716-446655440003',
          project_id: '660e8400-e29b-41d4-a716-446655440002',
          name: 'Brew & Bean Coffee Shop',
          address: '789 Coffee Lane, Arts District, CA 90212',
          location_type: 'practical',
          status: 'approved',
          contact_name: 'Shop Owner',
          contact_phone: '+1-555-0123',
          cost_per_day: 200.0,
          parking_info: 'Small lot behind building',
          power_info: 'Multiple outlets, good for equipment',
        },
      ];

      for (const location of locations) {
        await client.query(
          `
          INSERT INTO plotops.locations (id, project_id, name, address, location_type, status, contact_name, contact_phone, cost_per_day, parking_info, power_info, permits_required)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        `,
          [
            location.id,
            location.project_id,
            location.name,
            location.address,
            location.location_type,
            location.status,
            location.contact_name,
            location.contact_phone,
            location.cost_per_day,
            location.parking_info,
            location.power_info,
            location.permits_required || false,
          ]
        );
      }

      spinner.succeed(`Locations seeded (${locations.length} records)`);
    } catch (error) {
      spinner.fail('Failed to seed locations');
      throw error;
    }
  }

  async seedProps(client) {
    const spinner = ora('Seeding props...').start();

    try {
      const props = [
        {
          id: 'aa0e8400-e29b-41d4-a716-446655440001',
          project_id: '660e8400-e29b-41d4-a716-446655440001',
          name: 'Police Badge',
          category: 'prop',
          description: 'Authentic-looking detective badge',
          source: 'rental',
          cost: 25.0,
          vendor: 'Props R Us',
        },
        {
          id: 'aa0e8400-e29b-41d4-a716-446655440002',
          project_id: '660e8400-e29b-41d4-a716-446655440001',
          name: 'Black Sedan',
          category: 'vehicle',
          description: 'Unmarked police car for chase scenes',
          source: 'rental',
          cost: 300.0,
          vendor: 'Movie Cars Inc',
        },
        {
          id: 'aa0e8400-e29b-41d4-a716-446655440003',
          project_id: '660e8400-e29b-41d4-a716-446655440002',
          name: 'Espresso Machine',
          category: 'set_piece',
          description: 'Professional espresso machine for coffee shop',
          source: 'existing',
          cost: 0.0,
          vendor: 'Location provided',
        },
      ];

      for (const prop of props) {
        await client.query(
          `
          INSERT INTO plotops.props (id, project_id, name, category, description, source, cost, vendor)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        `,
          [
            prop.id,
            prop.project_id,
            prop.name,
            prop.category,
            prop.description,
            prop.source,
            prop.cost,
            prop.vendor,
          ]
        );
      }

      spinner.succeed(`Props seeded (${props.length} records)`);
    } catch (error) {
      spinner.fail('Failed to seed props');
      throw error;
    }
  }

  async seedActors(client) {
    const spinner = ora('Seeding actors...').start();

    try {
      const actors = [
        {
          id: 'bb0e8400-e29b-41d4-a716-446655440001',
          first_name: 'Michael',
          last_name: 'Thompson',
          email: 'michael.thompson@email.com',
          phone: '+1-555-1001',
          age_range: '50-60',
          union_status: 'SAG-AFTRA',
          special_skills: ['Firearms training', 'Motorcycle riding'],
        },
        {
          id: 'bb0e8400-e29b-41d4-a716-446655440002',
          first_name: 'Emma',
          last_name: 'Rodriguez',
          email: 'emma.rodriguez@email.com',
          phone: '+1-555-1002',
          age_range: '25-35',
          union_status: 'SAG-AFTRA',
          special_skills: ['Martial arts', 'Spanish fluent'],
        },
        {
          id: 'bb0e8400-e29b-41d4-a716-446655440003',
          first_name: 'David',
          last_name: 'Chen',
          email: 'david.chen@email.com',
          phone: '+1-555-1003',
          age_range: '30-40',
          union_status: 'Non-union',
          special_skills: ['Barista experience', 'Guitar playing'],
        },
      ];

      for (const actor of actors) {
        await client.query(
          `
          INSERT INTO plotops.actors (id, first_name, last_name, email, phone, age_range, union_status, special_skills)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        `,
          [
            actor.id,
            actor.first_name,
            actor.last_name,
            actor.email,
            actor.phone,
            actor.age_range,
            actor.union_status,
            actor.special_skills,
          ]
        );
      }

      spinner.succeed(`Actors seeded (${actors.length} records)`);
    } catch (error) {
      spinner.fail('Failed to seed actors');
      throw error;
    }
  }

  async seedCastingCalls(client) {
    const spinner = ora('Seeding casting calls...').start();

    try {
      const castingCalls = [
        {
          id: 'cc0e8400-e29b-41d4-a716-446655440001',
          project_id: '660e8400-e29b-41d4-a716-446655440001',
          character_id: '770e8400-e29b-41d4-a716-446655440001',
          title: 'Lead Role - Retired Detective',
          description:
            'Seeking experienced actor for lead role of retired detective John Morrison',
          requirements:
            'Male, 50-60, previous law enforcement or detective roles preferred',
          status: 'auditions',
          is_public: true,
        },
        {
          id: 'cc0e8400-e29b-41d4-a716-446655440002',
          project_id: '660e8400-e29b-41d4-a716-446655440002',
          character_id: '770e8400-e29b-41d4-a716-446655440004',
          title: 'Lead Role - Corporate Lawyer',
          description:
            'Seeking actress for lead role of ambitious corporate lawyer',
          requirements:
            'Female, 28-35, professional demeanor, comedy experience a plus',
          status: 'open',
          is_public: true,
        },
      ];

      for (const casting of castingCalls) {
        await client.query(
          `
          INSERT INTO plotops.casting_calls (id, project_id, character_id, title, description, requirements, status, is_public)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        `,
          [
            casting.id,
            casting.project_id,
            casting.character_id,
            casting.title,
            casting.description,
            casting.requirements,
            casting.status,
            casting.is_public,
          ]
        );
      }

      spinner.succeed(`Casting calls seeded (${castingCalls.length} records)`);
    } catch (error) {
      spinner.fail('Failed to seed casting calls');
      throw error;
    }
  }

  async linkSceneData(client) {
    const spinner = ora('Linking scene data...').start();

    try {
      // Link characters to scenes
      const sceneCharacters = [
        {
          scene_id: '880e8400-e29b-41d4-a716-446655440001',
          character_id: '770e8400-e29b-41d4-a716-446655440001',
          is_speaking: true,
          lines_count: 15,
        },
        {
          scene_id: '880e8400-e29b-41d4-a716-446655440002',
          character_id: '770e8400-e29b-41d4-a716-446655440001',
          is_speaking: true,
          lines_count: 8,
        },
        {
          scene_id: '880e8400-e29b-41d4-a716-446655440002',
          character_id: '770e8400-e29b-41d4-a716-446655440002',
          is_speaking: true,
          lines_count: 12,
        },
        {
          scene_id: '880e8400-e29b-41d4-a716-446655440004',
          character_id: '770e8400-e29b-41d4-a716-446655440004',
          is_speaking: true,
          lines_count: 5,
        },
        {
          scene_id: '880e8400-e29b-41d4-a716-446655440004',
          character_id: '770e8400-e29b-41d4-a716-446655440005',
          is_speaking: true,
          lines_count: 3,
        },
      ];

      for (const sc of sceneCharacters) {
        await client.query(
          `
          INSERT INTO plotops.scene_characters (scene_id, character_id, is_speaking, lines_count)
          VALUES ($1, $2, $3, $4)
        `,
          [sc.scene_id, sc.character_id, sc.is_speaking, sc.lines_count]
        );
      }

      // Link props to scenes
      const sceneProps = [
        {
          scene_id: '880e8400-e29b-41d4-a716-446655440001',
          prop_id: 'aa0e8400-e29b-41d4-a716-446655440001',
          quantity: 1,
        },
        {
          scene_id: '880e8400-e29b-41d4-a716-446655440003',
          prop_id: 'aa0e8400-e29b-41d4-a716-446655440002',
          quantity: 1,
        },
        {
          scene_id: '880e8400-e29b-41d4-a716-446655440004',
          prop_id: 'aa0e8400-e29b-41d4-a716-446655440003',
          quantity: 1,
        },
      ];

      for (const sp of sceneProps) {
        await client.query(
          `
          INSERT INTO plotops.scene_props (scene_id, prop_id, quantity)
          VALUES ($1, $2, $3)
        `,
          [sp.scene_id, sp.prop_id, sp.quantity]
        );
      }

      spinner.succeed('Scene data linking completed');
    } catch (error) {
      spinner.fail('Failed to link scene data');
      throw error;
    }
  }

  printSeedingSummary() {
    console.log(chalk.blue.bold('📊 Seeding Summary:\n'));
    console.log(chalk.white('Sample data created:'));
    console.log(
      chalk.gray('  • 2 Organizations (Sunset Studios, Moonlight Productions)')
    );
    console.log(
      chalk.gray(
        '  • 3 Projects (The Last Sunset, Coffee Shop Chronicles, Echoes of Tomorrow)'
      )
    );
    console.log(chalk.gray('  • 5 Characters across projects'));
    console.log(chalk.gray('  • 5 Scenes with detailed breakdowns'));
    console.log(chalk.gray('  • 3 Locations with contact information'));
    console.log(chalk.gray('  • 3 Props and set pieces'));
    console.log(chalk.gray('  • 3 Sample actors'));
    console.log(chalk.gray('  • 2 Active casting calls\n'));

    console.log(chalk.white('You can now:'));
    console.log(
      chalk.gray('  • Test the web application with sample projects')
    );
    console.log(
      chalk.gray('  • View casting calls on the public casting board')
    );
    console.log(chalk.gray('  • Explore scene breakdowns and scheduling'));
    console.log(chalk.gray('  • Test location scouting features\n'));
  }
}

// Run seeding if called directly
if (require.main === module) {
  const seeder = new DatabaseSeeder();
  seeder.run().catch(console.error);
}

module.exports = DatabaseSeeder;
