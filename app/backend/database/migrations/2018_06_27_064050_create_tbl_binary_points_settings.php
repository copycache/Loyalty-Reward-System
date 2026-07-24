<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateTblBinaryPointsSettings extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('tbl_binary_points_settings', function (Blueprint $table) 
        {
            $table->integer('membership_id');
            $table->integer('membership_entry_id');
            $table->double('membership_binary_points')->default(0);
        });

        Schema::table('tbl_membership', function (Blueprint $table) 
        {
            $table->double('membership_pairings_per_day')->default(0);
        });
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
