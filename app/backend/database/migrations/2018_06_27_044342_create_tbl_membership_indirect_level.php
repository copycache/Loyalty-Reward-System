<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateTblMembershipIndirectLevel extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('tbl_membership_indirect_level', function (Blueprint $table) 
        {
            $table->integer('membership_level');
            $table->integer('membership_id');
            $table->integer('membership_entry_id');
            $table->double('membership_indirect_income')->default(0);
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
