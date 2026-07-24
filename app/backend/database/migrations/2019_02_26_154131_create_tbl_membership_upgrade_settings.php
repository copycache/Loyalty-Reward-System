<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateTblMembershipUpgradeSettings extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create("tbl_membership_upgrade_settings",function ( Blueprint $table )
        {
            $table->increments('membership_upgrade_settings_id');
            $table->string('membership_upgrade_settings_method')->default("direct_downlines");
        });
        Schema::table("tbl_membership",function ( Blueprint $table )
        {
            $table->integer('required_upgrade_points')->default(0);
            $table->integer('given_upgrade_points')->default(0);
        });
        Schema::table("tbl_slot",function ( Blueprint $table )
        {
            $table->integer('slot_upgrade_points')->default(0);
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
