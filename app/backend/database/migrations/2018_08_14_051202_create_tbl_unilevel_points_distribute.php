<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateTblUnilevelPointsDistribute extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('tbl_unilevel_distribute', function (Blueprint $table) 
        {
            $table->increments('unilevel_distribute_id');
            $table->dateTime('unilevel_distribute_date_start');
            $table->dateTime('unilevel_distribute_end_start');
            $table->double('unilevel_personal_pv')->default(0);
            $table->double('unilevel_required_personal_pv')->default(0);
            $table->double('unilevel_group_pv')->default(0);
            $table->string('status')->default("");
            $table->double('unilevel_amount')->default(0);
            $table->double('unilevel_multiplier')->default(0);
            $table->dateTime('unilevel_date_distributed');
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
