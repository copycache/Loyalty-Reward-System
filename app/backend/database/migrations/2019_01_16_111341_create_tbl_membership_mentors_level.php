<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateTblMembershipMentorsLevel extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        if(!Schema::hasTable('tbl_membership_mentors_level'))
        {
            Schema::create('tbl_membership_mentors_level', function (Blueprint $table) 
            {
                $table->integer('membership_level');
                $table->integer('membership_id');
                $table->double('mentors_bonus')->default(0);
                $table->integer('mentors_direct')->default(0);
            });
        }
        
        if(!Schema::hasColumn('tbl_membership','mentors_level'))
        {
            Schema::table('tbl_membership', function (Blueprint $table) 
            {
                $table->integer('mentors_level')->default(0);
            });
        }
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        //
    }
}
