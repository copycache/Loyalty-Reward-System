<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class UpdateTblMembershipUnilevelLevelRelationships extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('tbl_membership_unilevel_level', function (Blueprint $table) 
        {
            $table->integer('membership_id')->unsigned()->change();
            $table->foreign('membership_id')->references('membership_id')->on('tbl_membership')->onDelete('cascade');
            $table->integer('membership_entry_id')->unsigned()->change();
            $table->foreign('membership_entry_id')->references('membership_id')->on('tbl_membership')->onDelete('cascade');
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
